<script setup lang="ts">
import type { NewsItem } from '@/types/models'
import { useLocalized } from '@/composables/useLocalized'

withDefaults(
  defineProps<{
    items: NewsItem[]
    /** notice：首頁深色公告帶；plain：首頁列表；boxed：白底框列表 */
    variant?: 'notice' | 'plain' | 'boxed'
  }>(),
  { variant: 'plain' },
)

const { pick, langOf } = useLocalized()
</script>

<template lang="pug">
ul.news-list(:class="`news-list--${variant}`")
  li.news-list__item(v-for="n in items" :key="n.id")
    RouterLink.news-list__link(:to="{ name: 'newsDetail', params: { id: n.id } }")
      time.news-list__date(:datetime="n.date.replaceAll('.', '-')") {{ n.date }}
      span.news-list__title(:lang="langOf(n.titleEn)") {{ pick(n.title, n.titleEn) }}
</template>

<style scoped lang="scss">
.news-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  &__link {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 14px;
    align-items: baseline;
    font-size: 14px;
    transition:
      background 0.2s,
      padding-left 0.2s;

    @include below(sm) {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }

  &__date {
    font-family: $f-display;
    font-size: 13px;
    font-weight: 700;
    color: $c-primary;
  }

  &__title {
    color: $c-text;
    line-height: 1.75;
  }

  // 首頁深色公告帶
  &--notice &__link {
    gap: 16px;
    padding: 12px 8px;
    border-bottom: 1px solid $c-divider-dark;
    color: $c-on-dark-4;
    @include hover {
      color: $c-on-dark-4;
      background: rgba(168, 195, 160, 0.14);
      padding-left: 16px;
    }
  }

  &--notice &__date {
    color: $c-on-dark;
  }

  &--notice &__title {
    color: inherit;
    line-height: 1.7;
  }

  // 首頁一般列表
  &--plain &__link {
    padding: 15px 0;
    border-bottom: 1px solid $c-line;
    @include hover {
      background: $c-sand-hover;
    }
  }

  // 白底框
  &--boxed &__link {
    grid-template-columns: 110px 1fr;
    gap: 16px;
    padding: 16px 22px;
    border-bottom: 1px solid $c-line-soft;
    @include hover {
      background: $c-row-hover;
    }

    @include below(sm) {
      grid-template-columns: 1fr;
      gap: 2px;
      padding: 14px 16px;
    }
  }

  &--boxed &__title {
    line-height: 1.8;
  }
}
</style>
