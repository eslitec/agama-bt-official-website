<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import SearchField from '@/components/common/SearchField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminDownloadsStore } from '@/stores/adminDownloads'
import { takeAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { useSortable } from '@/composables/useSortable'
import { groupAdminDownloads, matchesDownload } from '@/utils/admin-downloads'
import type { AdminDownloadItem } from '@/types/models'

type Visibility = 'all' | 'visible' | 'hidden'

const { t } = useI18n()
const store = useAdminDownloadsStore()
const { run, messageOf } = useAdminRequest()

const loading = ref(false)
const loadError = ref('')
const notice = ref(takeAdminFlash())

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { items } = await run(adminApi.listDownloads)
    store.setAll(items)
  } catch (e) {
    loadError.value = messageOf(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

const query = ref('')
const visibility = ref<Visibility>('all')
const visibilityOptions: Visibility[] = ['all', 'visible', 'hidden']
watch([query, visibility], () => (sortError.value = ''))

const filtered = computed(() =>
  store.items.filter(
    (d) =>
      matchesDownload(d, query.value) &&
      (visibility.value === 'all' || (visibility.value === 'visible' ? d.visible : !d.visible)),
  ),
)
/** 依分類編號分組顯示，順序沿用試算表的列順序 */
const groups = computed(() => groupAdminDownloads(filtered.value))

/**
 * 有搜尋或篩選時不能調整順序：被篩掉的項目仍然在同一個分類裡，
 * 拖曳的結果會和畫面上看到的不一樣。
 */
const canSort = computed(() => !query.value.trim() && visibility.value === 'all')

/* 排序 */
const sortError = ref('')
/** 剛移動的那一筆：短暫標示，讓使用者看得出來是哪一列動了 */
const moved = ref(0)
let movedTimer: ReturnType<typeof setTimeout> | undefined

const sortable = useSortable({
  enabled: () => canSort.value && !loading.value,
  describe: (m) =>
    m.kind === 'cancelled'
      ? t('admin.sort.cancelled')
      : t(`admin.sort.${m.kind}`, { index: m.index, total: m.total }),
  commit: async (id, beforeId) => {
    sortError.value = ''
    try {
      const { items } = await run((token) => adminApi.reorderDownload(token, id, beforeId))
      store.setAll(items)
      clearSheetCache()
    } catch (e) {
      sortError.value = messageOf(e)
      throw e
    }
  },
  settled: (id) => afterSort(id),
})

const {
  onPointerDown,
  onKeydown,
  orderOf,
  isGrabbed,
  isDragging,
  lineBefore,
  lineAtEnd,
  busy: sorting,
  message: sortMessage,
} = sortable

/** 清單重畫後焦點會掉：把焦點放回同一筆的控點，才能接著繼續調整 */
async function afterSort(id: number): Promise<void> {
  await nextTick()
  const grip = document.querySelector(`[data-id="${id}"] .admin-table__grip`)
  if (grip instanceof HTMLButtonElement) grip.focus()
  moved.value = id
  clearTimeout(movedTimer)
  movedTimer = setTimeout(() => (moved.value = 0), 1600)
}

/** 每一列的狀態樣式。pug 樣板不放這種多條件判斷，留在這裡好讀也好改 */
function rowClass(d: AdminDownloadItem, group: AdminDownloadItem[]): Record<string, boolean> {
  return {
    'admin-table__row--off': !d.visible,
    'is-moved': moved.value === d.id,
    'is-dragging': isDragging(d.id),
    'is-grabbed': isGrabbed(d.id),
    'is-drop-before': lineBefore(d.id),
    'is-drop-end': lineAtEnd() && d.id === group[group.length - 1]?.id,
  }
}

/** 鍵盤拿起某一筆時，那一組要照預覽順序重排 */
function rowsOf(items: AdminDownloadItem[]): AdminDownloadItem[] {
  const ids = orderOf(items.map((d) => d.id))
  return ids.map((id) => items.find((d) => d.id === id)).filter((d) => !!d)
}

/* 刪除 */
const target = ref<AdminDownloadItem | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function askDelete(item: AdminDownloadItem): void {
  deleteError.value = ''
  target.value = item
}

async function confirmDelete(): Promise<void> {
  const item = target.value
  if (!item || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await run((token) => adminApi.deleteDownload(token, item.id))
    store.remove(item.id)
    clearSheetCache()
    target.value = null
    notice.value = t('admin.downloads.deleted')
  } catch (e) {
    if (e instanceof adminApi.AdminApiError && e.code === 'NOT_FOUND') store.remove(item.id)
    deleteError.value = messageOf(e)
  } finally {
    deleting.value = false
  }
}
</script>

<template lang="pug">
section.admin-list
  header.admin-list__head
    .admin-list__heading
      h1.admin-list__title {{ t('admin.downloads.title') }}
      RouterLink.admin-list__public(:to="{ name: 'download' }" target="_blank" rel="noopener")
        | {{ t('admin.viewPublic') }}
        span.visually-hidden {{ t('common.externalLink') }}
    RouterLink.btn.btn--primary(:to="{ name: 'adminDownloadNew' }")
      MIcon(name="add" :size="18")
      | {{ t('admin.downloads.add') }}
  p.form-alert.form-alert--success(v-if="notice" role="status") {{ notice }}
  p.admin-list__lead {{ t('admin.downloads.lead') }}

  .admin-list__toolbar
    SearchField(
      v-model="query"
      variant="plain"
      :label="t('admin.downloads.searchLabel')"
      :placeholder="t('admin.downloads.searchPlaceholder')"
    )
    .segmented(role="radiogroup" :aria-label="t('admin.news.filterLabel')")
      label.segmented__item(v-for="v in visibilityOptions" :key="v")
        input.segmented__input(
          v-model="visibility"
          type="radio"
          name="dl-visibility"
          :value="v"
        )
        span.segmented__text {{ t(`admin.news.filters.${v}`) }}

  p.form-alert(v-if="loadError" role="alert")
    | {{ loadError }}
    |
    button.text-link(type="button" @click="load") {{ t('common.retry') }}
  p.form-alert(v-if="sortError" role="alert") {{ sortError }}
  p.admin-list__hint(v-if="store.loaded && !canSort && filtered.length") {{ t('admin.downloads.sortLocked') }}
  p.admin-list__hint(v-else-if="store.loaded && filtered.length") {{ t('admin.sort.hint') }}
  //- 拖曳與鍵盤移動都只有視覺變化，螢幕閱讀器要靠這裡才知道發生什麼事
  .visually-hidden(aria-live="assertive") {{ sortMessage }}

  .admin-list__summary(aria-live="polite")
    span {{ t('admin.downloads.count', { count: filtered.length }) }}
    span.admin-list__loading(v-if="loading") {{ t('common.loading') }}

  template(v-if="store.loaded")
    section.admin-group(v-for="g in groups" :key="g.n")
      h2.admin-group__title
        span.admin-group__n {{ g.n }}
        | {{ g.title }}
      .admin-table
        ul.admin-table__body(data-sortable)
          li.admin-table__row(
            v-for="d in rowsOf(g.items)"
            :key="d.id"
            :class="rowClass(d, g.items)"
            :data-id="d.id"
          )
            button.admin-table__grip(
              type="button"
              :disabled="!canSort || sorting"
              :aria-label="t('admin.sort.handle', { name: d.name })"
              :aria-pressed="isGrabbed(d.id)"
              @pointerdown="onPointerDown($event, d.id)"
              @keydown="onKeydown($event, d.id)"
            )
              MIcon(name="drag_indicator" :size="18")
            span.admin-table__date {{ d.ext }}
            .admin-table__main
              RouterLink.admin-table__title(
                :to="{ name: 'adminDownloadEdit', params: { id: d.id } }"
              ) {{ d.name }}
              a.admin-table__meta.admin-table__link(
                :href="d.href"
                :title="d.href"
                target="_blank"
                rel="noopener noreferrer"
              ) {{ d.href }}
            span.badge(:class="d.visible ? 'badge--on' : 'badge--off'")
              | {{ d.visible ? t('admin.news.visible') : t('admin.news.hidden') }}
            .admin-table__actions
              RouterLink.btn.btn--outline.btn--sm(
                :to="{ name: 'adminDownloadEdit', params: { id: d.id } }"
                :aria-label="t('admin.downloads.editLabel', { name: d.name })"
              )
                MIcon(name="edit" :size="16")
                | {{ t('admin.news.edit') }}
              button.btn.btn--danger.btn--sm(
                type="button"
                :aria-label="t('admin.downloads.deleteLabel', { name: d.name })"
                @click="askDelete(d)"
              )
                MIcon(name="delete" :size="16")
                | {{ t('admin.news.delete') }}
    .admin-table(v-if="!filtered.length")
      p.admin-table__empty {{ t('admin.downloads.empty') }}

  ConfirmDialog(
    :open="!!target"
    :title="t('admin.downloads.deleteTitle')"
    :confirm-text="deleting ? t('admin.news.deleting') : t('admin.news.deleteConfirm')"
    :cancel-text="t('admin.cancel')"
    :busy="deleting"
    :error="deleteError"
    danger
    @confirm="confirmDelete"
    @cancel="target = null"
  )
    p.admin-list__target(v-if="target")
      strong {{ target.ext }}
      |
      | {{ target.name }}
    p {{ t('admin.downloads.deleteBody') }}
</template>

<style scoped lang="scss">
/* 共用樣式在 src/styles/_admin.scss；此頁第一欄是拖曳控點，第二欄是格式而非日期 */
.admin-table__row {
  position: relative;
  grid-template-columns: 30px 56px minmax(0, 1fr) 64px auto;

  // 拖曳中的那一列淡化，讓插入線成為視線焦點
  &.is-dragging {
    opacity: 0.4;
  }

  // 鍵盤拿起：這一列看起來要「浮起來」，因為它會隨上下鍵一起移動
  &.is-grabbed {
    z-index: 1;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
    outline: 2px solid $c-primary;
    outline-offset: -2px;
  }

  // 放開後會落在哪裡：一條線，不即時重排，避免拖曳時整個清單跳動
  &.is-drop-before::before,
  &.is-drop-end::after {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    height: 2px;
    background: $c-primary;
  }

  &.is-drop-before::before {
    top: -1px;
  }

  &.is-drop-end::after {
    bottom: -1px;
  }
}

/* 拖曳控點：touch-action none 才不會在手機上變成捲動頁面 */
.admin-table__grip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 36px;
  border: 0;
  background: none;
  color: $c-muted;
  cursor: grab;
  touch-action: none;
  @include focus-ring;

  @include hover {
    color: $c-ink;
  }

  &:active {
    cursor: grabbing;
  }

  &[aria-pressed='true'] {
    color: $c-primary;
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }
}

.admin-table__date {
  font-size: 12px;
  letter-spacing: 0.04em;
}

/* 網址只是給管理者辨識用，不要讓它換行把清單撐長（完整網址放 title） */
.admin-table__link {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-wrap: normal;
  @include hover {
    color: $c-primary;
    text-decoration: underline;
  }
}

.admin-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  & + & {
    margin-top: 8px;
  }

  &__title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: $c-ink;
  }

  &__n {
    font-family: $f-display;
    font-size: 13px;
    color: $c-primary;
  }
}
</style>
