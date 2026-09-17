<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocalized } from '@/composables/useLocalized'
import { fetchLinks } from '@/api'

const { t } = useI18n()
const { pick, langOf } = useLocalized()
const { data: links, loading, error, reload } = useAsyncData(fetchLinks, [])
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 26px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('link.eyebrow')" :title="t('link.title')")
    AsyncState(:loading="loading" :error="error" @retry="reload")
      ul.link-grid(v-reveal.stagger)
        li(v-for="l in links" :key="l.n")
          a.link-card(:href="l.href" target="_blank" rel="noopener")
            span.link-card__num {{ l.n }}
            span.link-card__name(:lang="langOf(l.nameEn)") {{ pick(l.name, l.nameEn) }}
            span.link-card__arrow(aria-hidden="true") ↗
            span.visually-hidden {{ t('common.externalLink') }}
</template>

<style scoped lang="scss">
.link-grid {
  @include auto-grid(320px, 10px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.link-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid $c-line;
  background: $c-white;
  font-size: 14px;
  color: $c-ink;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;
  @include hover {
    color: $c-ink;
    background: $c-sand-hover;
    border-color: $c-primary;
    transform: translateX(3px);
  }

  &__num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-primary;
  }

  &__name {
    flex: 1;
    line-height: 1.7;
  }

  &__arrow {
    color: $c-muted;
  }
}
</style>
