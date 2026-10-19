import { ref } from 'vue'

/**
 * 清單拖曳排序。
 *
 * 只用一顆「拖曳控點」按鈕同時支援兩種操作，不另外放上下箭頭：
 * - 滑鼠／觸控：按住控點拖曳，畫面上用一條線標示會落在哪裡，放開才送出。
 * - 鍵盤：焦點移到控點按空白鍵「拿起」，上下鍵移動（清單會即時預覽），
 *   再按一次空白鍵放下、Esc 取消。拿起與移動都會念出目前位置給螢幕閱讀器。
 *
 * 只用拖曳會讓鍵盤與螢幕閱讀器使用者完全無法排序，所以鍵盤那條路徑不是附加功能，
 * 是這個元件成立的前提。
 */

/** 拖曳要移動幾個像素才算開始：避免點一下控點就被當成拖曳 */
const DRAG_THRESHOLD = 4

export type SortableMessage =
  | { kind: 'grabbed'; index: number; total: number }
  | { kind: 'moved'; index: number; total: number }
  | { kind: 'dropped'; index: number; total: number }
  | { kind: 'cancelled' }

export interface UseSortableOptions {
  /** 送出排序。beforeId 為 null 代表移到這一組的最後面；失敗請往外丟 */
  commit: (id: number, beforeId: number | null) => Promise<void>
  /** 送出結束（成功或失敗都會呼叫）。清單重畫後要做的事放這裡，例如把焦點放回控點 */
  settled?: (id: number) => void | Promise<void>
  /** 目前是否允許排序（例如有搜尋條件時不允許） */
  enabled: () => boolean
  /** 轉成要念給螢幕閱讀器聽的句子 */
  describe: (m: SortableMessage) => string
}

const idsOf = (list: Element): number[] =>
  [...list.querySelectorAll<HTMLElement>('[data-id]')].map((el) => Number(el.dataset.id))

/** 把 id 從陣列裡抽出來，插到 beforeId 之前；beforeId 為 null 則插到最後 */
const reorder = (ids: number[], id: number, beforeId: number | null): number[] => {
  const rest = ids.filter((x) => x !== id)
  const at = beforeId === null ? rest.length : rest.indexOf(beforeId)
  if (at < 0) return ids
  rest.splice(at, 0, id)
  return rest
}

const same = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

export function useSortable(opts: UseSortableOptions) {
  /** 正在拖曳或已被鍵盤拿起的那一筆 */
  const activeId = ref(0)
  const mode = ref<'pointer' | 'key' | null>(null)
  /** 放開後會落在哪一筆之前；null＝落在最後面 */
  const beforeId = ref<number | null>(null)
  /** 鍵盤模式的即時預覽順序（滑鼠模式只畫線、不重排，避免拖曳時畫面跳動） */
  const preview = ref<number[] | null>(null)
  const busy = ref(false)
  const message = ref('')

  let startIds: number[] = []
  let list: Element | null = null

  const say = (m: SortableMessage): void => {
    message.value = opts.describe(m)
  }

  function reset(): void {
    activeId.value = 0
    mode.value = null
    beforeId.value = null
    preview.value = null
    list = null
    startIds = []
  }

  async function finish(next: number[]): Promise<void> {
    const id = activeId.value
    const at = next.indexOf(id)
    const after = next[at + 1]
    const target = after === undefined ? null : after
    reset()
    if (same(next, startIds)) return
    busy.value = true
    try {
      await opts.commit(id, target)
      say({ kind: 'dropped', index: at + 1, total: next.length })
    } catch {
      // 失敗訊息由呼叫端以 role="alert" 顯示，這裡不要念「已放下」
    } finally {
      busy.value = false
    }
    // 要等 busy 解除才做：控點在送出期間是 disabled，這時 focus() 會沒有作用
    await opts.settled?.(id)
  }

  /* ── 滑鼠與觸控 ── */

  function onPointerDown(e: PointerEvent, id: number): void {
    if (busy.value || mode.value || !opts.enabled() || e.button !== 0) return
    const handle = e.currentTarget as HTMLElement
    list = handle.closest('[data-sortable]')
    if (!list) return

    const startY = e.clientY
    let dragging = false
    startIds = idsOf(list)

    const move = (ev: PointerEvent): void => {
      if (!dragging) {
        if (Math.abs(ev.clientY - startY) < DRAG_THRESHOLD) return
        dragging = true
        activeId.value = id
        mode.value = 'pointer'
        handle.setPointerCapture(ev.pointerId)
      }
      beforeId.value = dropTargetAt(ev.clientY, id)
      ev.preventDefault()
    }

    const up = (): void => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', cancel)
      if (!dragging) return reset()
      void finish(reorder(startIds, id, beforeId.value))
    }

    const cancel = (): void => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', cancel)
      reset()
    }

    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', cancel)
  }

  /** 游標在這個高度時，會插在哪一筆之前（超過最後一筆的中線就是最後面） */
  function dropTargetAt(y: number, id: number): number | null {
    if (!list) return null
    for (const el of list.querySelectorAll<HTMLElement>('[data-id]')) {
      const rowId = Number(el.dataset.id)
      if (rowId === id) continue
      const r = el.getBoundingClientRect()
      if (y < r.top + r.height / 2) return rowId
    }
    return null
  }

  /* ── 鍵盤 ── */

  function onKeydown(e: KeyboardEvent, id: number): void {
    if (busy.value || !opts.enabled()) return
    const handle = e.currentTarget as HTMLElement
    const grabbed = mode.value === 'key' && activeId.value === id

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!grabbed) {
        if (mode.value) return
        list = handle.closest('[data-sortable]')
        if (!list) return
        startIds = idsOf(list)
        preview.value = [...startIds]
        activeId.value = id
        mode.value = 'key'
        say({ kind: 'grabbed', index: startIds.indexOf(id) + 1, total: startIds.length })
        return
      }
      void finish(preview.value ?? startIds)
      return
    }

    if (!grabbed) return

    if (e.key === 'Escape') {
      e.preventDefault()
      reset()
      say({ kind: 'cancelled' })
      return
    }

    const order = preview.value ?? startIds
    const at = order.indexOf(id)
    let to = at
    if (e.key === 'ArrowUp') to = at - 1
    else if (e.key === 'ArrowDown') to = at + 1
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = order.length - 1
    else return

    e.preventDefault()
    if (to < 0 || to >= order.length || to === at) return
    const next = [...order]
    next.splice(to, 0, next.splice(at, 1)[0])
    preview.value = next
    say({ kind: 'moved', index: to + 1, total: next.length })
  }

  /** 鍵盤拿起時，這一組要照預覽順序顯示 */
  function orderOf(ids: number[]): number[] {
    const p = preview.value
    if (!p || !ids.includes(activeId.value)) return ids
    return p.filter((x) => ids.includes(x))
  }

  return {
    activeId,
    mode,
    beforeId,
    busy,
    message,
    onPointerDown,
    onKeydown,
    orderOf,
    isGrabbed: (id: number): boolean => mode.value === 'key' && activeId.value === id,
    isDragging: (id: number): boolean => mode.value === 'pointer' && activeId.value === id,
    /** 插入線是否畫在這一筆上方 */
    lineBefore: (id: number): boolean => mode.value === 'pointer' && beforeId.value === id,
    /** 插入線是否畫在整組最後面 */
    lineAtEnd: (): boolean => mode.value === 'pointer' && beforeId.value === null,
  }
}
