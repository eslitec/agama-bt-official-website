<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import InfoPanel from '@/components/common/InfoPanel.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { fetchProcessSteps } from '@/api'

type HowTab = 'organic' | 'traceable'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { data: steps, loading, error, reload } = useAsyncData(fetchProcessSteps, [])

const tab = computed<HowTab>({
  get: () => (route.query.tab === 'traceable' ? 'traceable' : 'organic'),
  set: (v) => router.replace({ query: v === 'organic' ? {} : { tab: v } }),
})

const tabs = computed(() => [
  { key: 'organic' as const, label: t('how.tabOrganic') },
  { key: 'traceable' as const, label: t('how.tabTraceable') },
])
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 32px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('how.eyebrow')" :title="t('how.title')" :lead="t('how.lead')")
    .how-tabs(role="tablist" :aria-label="t('how.title')")
      button.how-tabs__tab(
        v-for="item in tabs"
        :id="`how-tab-${item.key}`"
        :key="item.key"
        type="button"
        role="tab"
        :class="{ 'is-active': tab === item.key }"
        :aria-selected="tab === item.key"
        :aria-controls="`how-panel-${item.key}`"
        @click="tab = item.key"
      ) {{ item.label }}

    #how-panel-traceable.how-panel(
      v-if="tab === 'traceable'"
      role="tabpanel"
      aria-labelledby="how-tab-traceable"
    )
      EmptyState(icon="description" :message="t('how.traceableEmpty')")

    #how-panel-organic.how-panel(v-else role="tabpanel" aria-labelledby="how-tab-organic")
      AsyncState(:loading="loading" :error="error" @retry="reload")
        ol.how-steps(v-reveal.stagger)
          li.how-step(v-for="s in steps" :key="s.n")
            .how-step__head
              span.how-step__num {{ t('common.step', { n: s.n }) }}
              h2.how-step__title(lang="zh-Hant-TW") {{ s.title }}
            p.how-step__body(lang="zh-Hant-TW") {{ s.body }}
      InfoPanel(:title="t('how.addressTitle')" size="lg")
        p {{ t('common.mailing', { address: t('site.address'), company: t('site.company') }) }}
        RouterLink.text-link(:to="{ name: 'download' }") {{ t('how.downloadLink') }}
</template>

<style scoped lang="scss">
.how-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  &__tab {
    @include button-reset;
    padding: 12px 20px;
    border: 1px solid $c-primary;
    background: $c-paper;
    color: $c-primary;
    font-size: 14px;
    font-weight: 700;
    transition: background 0.2s;
    @include focus-ring;
    @include hover {
      background: $c-sand;
    }

    &.is-active {
      background: $c-primary;
      color: $c-paper;
    }
  }
}

.how-panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.how-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how-step {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: start;
  padding: 26px 28px;
  border: 1px solid $c-line;
  border-left: 5px solid $c-primary;
  background: $c-white;

  @include below(md) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 22px 20px;
  }

  &__head {
    max-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-primary;
  }

  &__title {
    font-size: 21px;
    font-weight: 900;
    color: $c-ink;
  }

  &__body {
    font-size: 15px;
    line-height: 2.05;
    color: $c-text;
    text-wrap: pretty;
  }
}
</style>
