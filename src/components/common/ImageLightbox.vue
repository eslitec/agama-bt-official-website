<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import MIcon from './MIcon.vue'

const src = defineModel<string | null>({ default: null })
const { t } = useI18n()
const closeBtn = ref<HTMLButtonElement | null>(null)
const locked = useScrollLock(typeof document !== 'undefined' ? document.body : null)
let lastFocus: HTMLElement | null = null

const close = (): void => {
  src.value = null
}

watch(src, async (v) => {
  locked.value = Boolean(v)
  if (v) {
    lastFocus = document.activeElement as HTMLElement | null
    await nextTick()
    closeBtn.value?.focus()
  } else {
    lastFocus?.focus()
  }
})

onKeyStroke('Escape', () => {
  if (src.value) close()
})
</script>

<template lang="pug">
Teleport(to="body")
  Transition(name="lightbox")
    .lightbox(
      v-if="src"
      role="dialog"
      aria-modal="true"
      :aria-label="t('newsDetail.lightboxLabel')"
      @click="close"
    )
      img.lightbox__image(:src="src" alt="" @click.stop)
      button.lightbox__close(ref="closeBtn" type="button" @click.stop="close")
        MIcon(name="close" :size="26")
        | {{ t('newsDetail.lightboxClose') }}
</template>

<style scoped lang="scss">
.lightbox {
  position: fixed;
  inset: 0;
  z-index: $z-lightbox;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(10, 30, 34, 0.86);
  backdrop-filter: blur(6px);
  cursor: zoom-out;

  &__image {
    width: min(980px, 100%);
    height: 88vh;
    object-fit: contain;
    background: $c-white;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    cursor: default;
  }

  &__close {
    @include button-reset;
    position: absolute;
    top: 20px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: $c-paper;
    font-size: 14px;
    @include focus-ring($c-paper);
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
