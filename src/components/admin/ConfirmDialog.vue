<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmText: string
    cancelText: string
    /** 執行中：按鈕停用，不能關閉 */
    busy?: boolean
    /** 危險操作（刪除）時確認鈕為紅色 */
    danger?: boolean
    /** 錯誤訊息（顯示在按鈕上方） */
    error?: string
  }>(),
  { busy: false, danger: false, error: '' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()

const id = useId()
const panel = ref<HTMLElement | null>(null)
const cancelBtn = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus = document.activeElement as HTMLElement | null
      await nextTick()
      cancelBtn.value?.focus()
    } else {
      returnFocus?.focus?.()
      returnFocus = null
    }
  },
)

function cancel(): void {
  if (!props.busy) emit('cancel')
}

/** Tab 只在對話框內循環 */
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
    return
  }
  if (e.key !== 'Tab' || !panel.value) return
  const items = [...panel.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')]
  if (!items.length) return
  const first = items[0]!
  const last = items[items.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .confirm-dialog(v-if="open" @keydown="onKeydown")
    .confirm-dialog__backdrop(aria-hidden="true" @click="cancel")
    .confirm-dialog__panel(
      ref="panel"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="`${id}-title`"
      :aria-describedby="`${id}-body`"
    )
      h2.confirm-dialog__title(:id="`${id}-title`") {{ title }}
      .confirm-dialog__body(:id="`${id}-body`")
        slot
      p.form-alert(v-if="error" role="alert") {{ error }}
      .confirm-dialog__actions
        button.btn.btn--outline(
          ref="cancelBtn"
          type="button"
          :disabled="busy"
          @click="cancel"
        ) {{ cancelText }}
        button.btn.btn--primary(
          type="button"
          :class="{ 'confirm-dialog__danger': danger }"
          :disabled="busy"
          @click="emit('confirm')"
        ) {{ confirmText }}
</template>

<style scoped lang="scss">
.confirm-dialog {
  position: fixed;
  inset: 0;
  z-index: $z-lightbox;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $gutter;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(18, 50, 56, 0.55);
  }

  &__panel {
    position: relative;
    width: min(460px, 100%);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 28px;
    background: $c-white;
    box-shadow: $shadow-pop;

    @include below(sm) {
      padding: 22px 18px;
    }
  }

  &__title {
    font-size: 19px;
    font-weight: 900;
    line-height: 1.5;
    color: $c-ink;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    line-height: 1.8;
    color: $c-text;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;

    .btn:disabled {
      opacity: 0.65;
      cursor: progress;
    }

    @include below(sm) {
      .btn {
        flex: 1 1 120px;
      }
    }
  }

  &__danger {
    background: $c-danger;
    @include hover {
      background: #6f2e21;
    }
  }
}
</style>
