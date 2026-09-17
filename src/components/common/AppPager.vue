<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'
import { pageWindow } from '@/utils/pagination'

const props = defineProps<{ total: number }>()
const page = defineModel<number>({ required: true })
const { t } = useI18n()

// 手機只顯示首頁、目前頁、末頁；平板多顯示前後 1 頁；桌機前後 2 頁
const isPhone = useMediaQuery('(max-width: 479.98px)')
const isTablet = useMediaQuery('(max-width: 767.98px)')
const siblings = computed(() => (isPhone.value ? 0 : isTablet.value ? 1 : 2))
const tokens = computed(() => pageWindow(page.value, props.total, siblings.value))

const go = (n: number): void => {
  if (n >= 1 && n <= props.total && n !== page.value) page.value = n
}
</script>

<template lang="pug">
nav.pager(:aria-label="t('news.pagination')")
  button.pager__step(type="button" :disabled="page <= 1" @click="go(page - 1)")
    span(aria-hidden="true") ‹
    span.pager__step-text {{ t('news.prevText') }}
  template(v-for="tok in tokens" :key="tok")
    span.pager__gap(v-if="typeof tok !== 'number'" aria-hidden="true") …
    button.pager__num(
      v-else
      type="button"
      :class="{ 'is-current': tok === page }"
      :aria-current="tok === page ? 'page' : undefined"
      :aria-label="t('news.pageN', { n: tok })"
      @click="go(tok)"
    ) {{ tok }}
  button.pager__step(type="button" :disabled="page >= total" @click="go(page + 1)")
    span.pager__step-text {{ t('news.nextText') }}
    span(aria-hidden="true") ›
</template>

<style scoped lang="scss">
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 4px;

  &__step,
  &__num {
    @include button-reset;
    border: 1px solid $c-line-2;
    background: $c-white;
    font-size: 14px;
    transition:
      background 0.2s,
      border-color 0.2s;
    @include focus-ring;
  }

  &__step {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 40px;
    color: $c-primary;
    padding: 9px 16px;

    @include below(sm) {
      padding-inline: 13px;
    }
    @include hover {
      background: $c-sand;
      border-color: $c-primary;
    }

    &:disabled {
      color: $c-disabled;
      cursor: default;
      pointer-events: none;
    }
  }

  &__gap {
    min-width: 24px;
    text-align: center;
    color: $c-muted;
    font-family: $f-display;
  }

  &__step-text {
    @include below(sm) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  }

  &__num {
    min-width: 40px;
    min-height: 40px;
    padding: 9px 0;
    text-align: center;
    color: $c-text;
    font-family: $f-display;
    @include hover {
      border-color: $c-primary;
    }

    &.is-current {
      background: $c-primary;
      border-color: $c-primary;
      color: $c-paper;
      font-weight: 700;
    }
  }
}
</style>
