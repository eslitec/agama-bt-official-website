<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import FileLink from '@/components/common/FileLink.vue'
import InfoPanel from '@/components/common/InfoPanel.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { fetchFeeDocs } from '@/api'

const { t } = useI18n()
const { data: fees, loading, error, reload } = useAsyncData(fetchFeeDocs, [])
</script>

<template lang="pug">
.page.l-section
  .page__inner.l-container
    PageHeading(:eyebrow="t('fee.eyebrow')" :title="t('fee.title')" :lead="t('fee.lead')")
    AsyncState(:loading="loading" :error="error" @retry="reload")
      .fee-grid(v-reveal.stagger)
        FileLink(
          v-for="f in fees"
          :key="f.href"
          :name="f.name"
          :href="f.href"
          ext="PDF"
          icon="picture_as_pdf"
          variant="feature"
        )
    InfoPanel
      p {{ t('fee.note') }}
</template>

<style scoped lang="scss">
.fee-grid {
  @include auto-grid(300px, 14px);
}
</style>
