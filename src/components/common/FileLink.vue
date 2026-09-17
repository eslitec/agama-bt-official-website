<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MIcon from './MIcon.vue'

withDefaults(
  defineProps<{
    name: string
    href: string
    ext: string
    /** card：白底卡片；tile：米色底磚；feature：收費文件大卡 */
    variant?: 'card' | 'tile' | 'feature'
    icon?: string
  }>(),
  { variant: 'card', icon: 'description' },
)

const { t } = useI18n()
</script>

<template lang="pug">
a.file-link(
  :class="`file-link--${variant}`"
  :href="href"
  target="_blank"
  rel="noopener"
  :aria-label="`${t('common.fileLabel', { name, ext })} ${t('common.externalLink')}`"
)
  MIcon.file-link__icon(:name="icon")
  span.file-link__name(lang="zh-Hant-TW") {{ name }}
  span.file-link__ext {{ ext }} ↓
</template>

<style scoped lang="scss">
.file-link {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: $c-ink;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;

  &__icon {
    font-size: 21px;
    color: $c-primary;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    line-height: 1.6;
  }

  &__ext {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-muted;
    white-space: nowrap;
  }

  &--card {
    border: 1px solid $c-line;
    background: $c-white;
    padding: 16px 18px;
    @include hover {
      color: $c-ink;
      background: $c-sand-hover;
      border-color: $c-primary;
      transform: translateX(3px);
    }
  }

  &--tile {
    gap: 12px;
    background: $c-paper;
    padding: 13px 16px;
    @include hover {
      color: $c-ink;
      background: $c-sand;
      transform: translateX(3px);
    }

    .file-link__icon {
      font-size: 19px;
    }
  }

  &--feature {
    gap: 16px;
    border: 1px solid $c-line;
    background: $c-white;
    padding: 26px;
    @include hover {
      color: $c-ink;
      background: $c-sand-hover;
      border-color: $c-primary;
      transform: translateY(-3px);
    }

    .file-link__icon {
      font-size: 32px;
    }

    .file-link__name {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.65;
    }
  }
}
</style>
