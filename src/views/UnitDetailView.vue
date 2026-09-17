<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import MIcon from '@/components/common/MIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocalized } from '@/composables/useLocalized'
import { fetchUnits } from '@/api'

const props = defineProps<{ cid: number }>()

const { t, tm, rt } = useI18n()
const { pick, langOf } = useLocalized()
const { data: units, loading, error, reload } = useAsyncData(fetchUnits, [])
const unit = computed(() => units.value.find((u) => u.cid === props.cid))
const tips = computed(() => (tm('unitDetail.tips') as unknown as string[]).map((v) => rt(v)))
const host = (url: string): string => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 24px")
  .page__inner.l-container
    AsyncState(:loading="loading" :error="error" @retry="reload")
      template(v-if="unit")
        PageHeading(
          :eyebrow="t('unit.eyebrow')"
          :title="pick(unit.name, unit.nameEn)"
          :lead="pick(unit.desc, unit.descEn)"
          :content-lang="langOf(unit.nameEn)"
          :lead-lang="langOf(unit.descEn)"
        )
          template(#before)
            RouterLink.text-link.unit-back(:to="{ name: 'unit' }") {{ t('unitDetail.back') }}

        section.portal-card(:style="{ '--cat-color': unit.color }" aria-labelledby="portal-title")
          MIcon.portal-card__icon(:name="unit.icon" :size="40")
          .portal-card__body
            h2#portal-title.portal-card__title {{ t('unitDetail.listTitle') }}
            p.portal-card__lead {{ t('unitDetail.listLead') }}
            dl.portal-card__meta
              dt {{ t('unitDetail.portalLabel') }}
              dd
                strong(:lang="langOf(unit.portalEn)") {{ pick(unit.portal, unit.portalEn) }}
                span.portal-card__host {{ host(unit.portalUrl) }}
            ul.portal-card__tips
              li(v-for="tip in tips" :key="tip") {{ tip }}
          a.btn.btn--primary.portal-card__go(:href="unit.portalUrl" target="_blank" rel="noopener")
            | {{ t('unitDetail.go') }} ↗
            span.visually-hidden {{ t('common.externalLink') }}

      template(v-else)
        EmptyState(icon="search_off" :message="t('unitDetail.notFound')")
        RouterLink.text-link.unit-back(:to="{ name: 'unit' }") {{ t('unitDetail.back') }}
</template>

<style scoped lang="scss">
.unit-back {
  font-size: 13px;
  align-self: flex-start;
}

.portal-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: 32px;
  border: 1px solid $c-line;
  border-top: 4px solid var(--cat-color);
  background: $c-white;

  @include below(md) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    padding: 24px 20px;
  }

  &__icon {
    color: var(--cat-color);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title {
    font-size: 20px;
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    font-size: 14px;
    line-height: 1.9;
    color: $c-text;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    margin: 0;
    font-size: 14px;

    dt {
      color: $c-muted;
    }

    dd {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 10px;
      margin: 0;
      color: $c-ink;
    }
  }

  &__host {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-muted;
    word-break: break-all;
  }

  &__tips {
    margin: 0;
    padding-left: 1.2em;
    font-size: 13px;
    line-height: 1.9;
    color: $c-muted;
  }

  &__go {
    padding-inline: 26px;

    @include below(md) {
      width: 100%;
    }
  }
}
</style>
