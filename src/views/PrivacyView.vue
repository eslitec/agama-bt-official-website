<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'

interface Section {
  title: string
  body: string[]
}

const { t, tm, rt } = useI18n()
const sections = computed<Section[]>(() =>
  (tm('privacy.sections') as unknown as { title: string; body: string[] }[]).map((s) => ({
    title: rt(s.title),
    body: s.body.map((b) => rt(b)),
  })),
)
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 28px")
  .page__inner.l-container.l-container--narrow
    PageHeading(
      :eyebrow="t('privacy.eyebrow')"
      :title="t('privacy.title')"
      :lead="t('privacy.lead')"
    )
    article.privacy
      section.privacy__section(v-for="s in sections" :key="s.title")
        h2.privacy__title {{ s.title }}
        p.privacy__para(v-for="(b, i) in s.body" :key="i") {{ b }}
      p.privacy__updated {{ t('privacy.updated') }}
</template>

<style scoped lang="scss">
.privacy {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 36px 40px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(md) {
    padding: 26px 20px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 17px;
    font-weight: 900;
    color: $c-ink;
  }

  &__para {
    font-size: 15px;
    line-height: 1.95;
    color: $c-text;
  }

  &__updated {
    padding-top: 14px;
    border-top: 1px solid $c-line-soft;
    font-size: 13px;
    color: $c-muted;
  }
}
</style>
