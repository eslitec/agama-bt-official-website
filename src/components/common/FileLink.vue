<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import MIcon from './MIcon.vue'
import { useLocalized } from '@/composables/useLocalized'

const props = withDefaults(
  defineProps<{
    name: string
    /** 英文檔名（英文介面有值時顯示） */
    nameEn?: string
    href: string
    ext: string
    /** 同一份文件的其他格式；有值時整列不再是連結，改在右側列出各格式的下載連結 */
    more?: { ext: string; href: string }[]
    /** card：白底卡片；tile：米色底磚；feature：收費文件大卡 */
    variant?: 'card' | 'tile' | 'feature'
    icon?: string
  }>(),
  { nameEn: undefined, more: undefined, variant: 'card', icon: 'description' },
)

const { t } = useI18n()
const { pick, langOf } = useLocalized()
const label = computed(() => pick(props.name, props.nameEn))
/** 所有格式（主要格式排第一） */
const formats = computed(() => [{ ext: props.ext, href: props.href }, ...(props.more ?? [])])
const multi = computed(() => formats.value.length > 1)
</script>

<template lang="pug">
//- 只有一種格式：整列就是下載連結
a.file-link(
  v-if="!multi"
  :class="`file-link--${variant}`"
  :href="href"
  target="_blank"
  rel="noopener"
  :aria-label="`${t('common.fileLabel', { name: label, ext })} ${t('common.externalLink')}`"
)
  MIcon.file-link__icon(:name="icon")
  span.file-link__name(:lang="langOf(nameEn)") {{ label }}
  span.file-link__ext {{ ext }} ↓
//- 多種格式：檔名不是連結，右側每種格式各一個連結
.file-link.file-link--multi(v-else :class="`file-link--${variant}`")
  MIcon.file-link__icon(:name="icon")
  span.file-link__name(:lang="langOf(nameEn)") {{ label }}
  span.file-link__formats
    a.file-link__ext.file-link__ext--link(
      v-for="f in formats"
      :key="f.href"
      :href="f.href"
      target="_blank"
      rel="noopener"
      :aria-label="`${t('common.fileLabel', { name: label, ext: f.ext })} ${t('common.externalLink')}`"
    ) {{ f.ext }} ↓
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

    &--link {
      color: $c-primary;
      @include focus-ring;
      @include hover {
        text-decoration: underline;
      }
    }
  }

  &__formats {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  // 多格式時整列不是連結，取消整列的 hover 位移
  &--multi {
    @include hover {
      transform: none;
    }
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
