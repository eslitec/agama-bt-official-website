<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import FileLink from '@/components/common/FileLink.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocalized } from '@/composables/useLocalized'
import { fetchDownloadGroups } from '@/api'

const { t } = useI18n()
const { pick, langOf } = useLocalized()
const { data: groups, loading, error, reload } = useAsyncData(fetchDownloadGroups, [])
</script>

<template lang="pug">
.page.l-section
  .page__inner.l-container
    PageHeading(:eyebrow="t('download.eyebrow')" :title="t('download.title')")
    AsyncState(:loading="loading" :error="error" @retry="reload")
      .download-groups
        section.download-group(
          v-for="g in groups"
          :key="g.n"
          v-reveal
          :aria-labelledby="`dl-${g.n}`"
        )
          header.download-group__head
            span.download-group__num {{ g.n }}
            h2.download-group__title(:id="`dl-${g.n}`" :lang="langOf(g.titleEn)")
              | {{ pick(g.title, g.titleEn) }}
            span.download-group__rule(aria-hidden="true")
          .download-group__files
            FileLink(
              v-for="f in g.files"
              :key="f.href"
              v-bind="f"
              variant="tile"
            )
</template>

<style scoped lang="scss">
.download-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.download-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 28px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(sm) {
    padding: 22px 16px;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-primary;
  }

  &__title {
    font-size: 18px;
    font-weight: 900;
    color: $c-ink;
  }

  &__rule {
    height: 1px;
    flex: 1;
    background: $c-line-soft-2;
  }

  &__files {
    @include auto-grid(300px, 8px);
  }
}
</style>
