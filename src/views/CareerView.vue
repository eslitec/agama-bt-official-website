<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocalized } from '@/composables/useLocalized'
import { fetchCareers } from '@/api'
import type { CareerKind } from '@/types/models'

const KINDS: CareerKind[] = ['job', 'training']

const { t } = useI18n()
const { pick, langOf } = useLocalized()
const { data: careers, loading, error, reload } = useAsyncData(fetchCareers, [])

const sections = computed(() =>
  KINDS.map((kind) => ({ kind, items: careers.value.filter((c) => c.kind === kind) })).filter(
    (s) => s.items.length,
  ),
)

/** mailto: 連結顯示成信箱，其他顯示成「前往」 */
const isMail = (href: string): boolean => href.startsWith('mailto:')
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 26px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('career.eyebrow')" :title="t('career.title')" :lead="t('career.lead')")
    AsyncState(:loading="loading" :error="error" @retry="reload")
      EmptyState(v-if="!sections.length" :message="t('career.empty')")
      section.career-section(v-for="s in sections" :key="s.kind" v-reveal)
        h2.career-section__title {{ t(`careers.kinds.${s.kind}`) }}
        ul.career-list
          li.career-card(v-for="c in s.items" :key="c.id")
            h3.career-card__title(:lang="langOf(c.titleEn)") {{ pick(c.title, c.titleEn) }}
            ul.career-card__meta(v-if="c.place || c.nature || c.period")
              li(v-if="c.place")
                span.career-card__label {{ t('career.place') }}
                | {{ c.place }}
              li(v-if="c.nature")
                span.career-card__label {{ t('career.nature') }}
                | {{ c.nature }}
              li(v-if="c.period")
                span.career-card__label {{ t('career.period') }}
                | {{ c.period }}
            p.career-card__body.pre-line(:lang="langOf(c.bodyEn)") {{ pick(c.body, c.bodyEn) }}
            a.career-card__link(
              v-if="c.href"
              :href="c.href"
              :target="isMail(c.href) ? undefined : '_blank'"
              :rel="isMail(c.href) ? undefined : 'noopener noreferrer'"
            )
              | {{ isMail(c.href) ? c.href.replace('mailto:', '') : t('career.go') }}
              span.visually-hidden(v-if="!isMail(c.href)") {{ t('common.externalLink') }}
      //- 聯絡方式放在 AsyncState 內，載入中與載入失敗時不要先冒出來
      p.career-contact {{ t('career.contact') }}
</template>

<style scoped lang="scss">
.career-section {
  & + & {
    margin-top: 32px;
  }

  &__title {
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 2px solid $c-primary;
    font-family: $f-serif;
    font-size: 20px;
    font-weight: 900;
    color: $c-ink;
  }
}

.career-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.career-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 22px 24px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(sm) {
    padding: 18px 16px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: $c-ink;
    overflow-wrap: anywhere;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: $c-text;

    li {
      display: flex;
      gap: 6px;
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  &__label {
    color: $c-muted;
  }

  &__body {
    font-size: 14px;
    line-height: 1.9;
    color: $c-text;
    overflow-wrap: anywhere;
  }

  &__link {
    font-size: 14px;
    font-weight: 700;
    color: $c-primary;
    overflow-wrap: anywhere;
    @include hover {
      text-decoration: underline;
    }
  }
}

.career-contact {
  margin-top: 26px;
  padding: 16px 18px;
  background: $c-sand;
  font-size: 13px;
  line-height: 1.9;
  color: $c-text;
  overflow-wrap: anywhere;
}
</style>
