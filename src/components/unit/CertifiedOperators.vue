<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppPager from '@/components/common/AppPager.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import SearchField from '@/components/common/SearchField.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useQueryParam } from '@/composables/useQueryParam'
import { fetchCertifiedOperators, hasCertifiedOperators } from '@/api'
import { paginate, parsePage } from '@/utils/pagination'
import type { CertifiedOperator, OperatorType } from '@/types/models'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const enabled = hasCertifiedOperators()
const { data, loading, error, reload } = useAsyncData(fetchCertifiedOperators, {
  items: [],
  sync: { organic: {}, tap: {} },
})

/* ── 網址參數：類別、縣市、關鍵字、頁碼、每頁筆數 ── */
const PER_PAGE_OPTIONS = [20, 50, 100]
const query = useQueryParam('oq', ['opage'])
const param = (key: string): string => {
  const v = route.query[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}
const setParam = (key: string, value: string, resetPage = true): void => {
  const next = { ...route.query, [key]: value || undefined }
  if (resetPage) delete next.opage
  void router.replace({ query: next })
}
const type = computed<OperatorType | ''>(() => {
  const v = param('type')
  return v === 'organic' || v === 'tap' ? v : ''
})
const city = computed(() => param('city'))
const page = computed({
  get: () => parsePage(route.query.opage),
  set: (n: number) => setParam('opage', n > 1 ? String(n) : '', false),
})
const perPage = computed(() => {
  const n = Number.parseInt(param('osize'), 10)
  return PER_PAGE_OPTIONS.includes(n) ? n : PER_PAGE_OPTIONS[0]!
})

/* ── 篩選 ── */
const items = computed(() => data.value.items)
const matches = (o: CertifiedOperator, q: string): boolean =>
  [o.name, o.city, o.products, o.certNo ?? ''].some((v) => v.toLowerCase().includes(q))
const keyword = computed(() => query.value.trim().toLowerCase())
const hitType = (o: CertifiedOperator): boolean => !type.value || o.type === type.value
const hitCity = (o: CertifiedOperator): boolean => !city.value || o.city === city.value
const hitQuery = (o: CertifiedOperator): boolean => !keyword.value || matches(o, keyword.value)
const filtered = computed(() => items.value.filter((o) => hitType(o) && hitCity(o) && hitQuery(o)))
const pageResult = computed(() => paginate(filtered.value, page.value, perPage.value))

/**
 * 膠囊上的數字代表「按下去會得到幾筆」，所以各自排除自己這一項篩選、套用其餘條件。
 * 否則選了縣市之後，類別膠囊仍顯示全站筆數，按下去筆數卻對不上。
 */
const forCityFacet = computed(() => items.value.filter((o) => hitType(o) && hitQuery(o)))
const forTypeFacet = computed(() => items.value.filter((o) => hitCity(o) && hitQuery(o)))

/** 縣市膠囊：依筆數由多到少，預設只顯示前 12 個 */
const CITY_LIMIT = 12
const showAllCities = ref(false)
const cityCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const o of forCityFacet.value) if (o.city) counts.set(o.city, (counts.get(o.city) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
})
const visibleCities = computed<[string, number][]>(() => {
  const list = showAllCities.value ? cityCounts.value : cityCounts.value.slice(0, CITY_LIMIT)
  // 目前選的縣市一定要留在清單裡（即使搭配關鍵字後是 0 筆），否則使用者沒辦法取消它
  if (city.value && !list.some(([name]) => name === city.value)) {
    return [...list, [city.value, cityCounts.value.find(([n]) => n === city.value)?.[1] ?? 0]]
  }
  return list
})
const typeCounts = computed(() => ({
  all: forTypeFacet.value.length,
  organic: forTypeFacet.value.filter((o) => o.type === 'organic').length,
  tap: forTypeFacet.value.filter((o) => o.type === 'tap').length,
}))

/* ── 資料更新時間（顯示實際同步成功時間，不是「每日更新」） ── */
const sync = computed(() => data.value.sync)
const updatedText = computed(() => {
  const parts = (['organic', 'tap'] as OperatorType[])
    .filter((k) => sync.value[k]?.syncedAt || sync.value[k]?.sourceDate)
    .map((k) => {
      const source = sync.value[k]?.sourceDate
      // 來源沒有「資料日期」欄位時（有機是即時資料），只顯示同步時間
      return t(source ? 'unit.operators.updatedOne' : 'unit.operators.updatedOneLive', {
        type: t(`unit.operators.${k}`),
        synced: sync.value[k]?.syncedAt ?? t('unit.operators.unknown'),
        source: source ?? t('unit.operators.unknown'),
      })
    })
  return parts.join('　')
})

/** 模板裡不要寫 TS 型別轉換：執行階段的模板編譯器看不懂 `as`，整個元件會編不出來 */
function onPerPage(e: Event): void {
  setParam('osize', (e.target as HTMLSelectElement).value)
}

const empty = computed(() => !loading.value && !error.value && !items.value.length)
</script>

<template lang="pug">
section.operators(v-if="enabled && !empty")
  header.operators__head
    h2.operators__title {{ t('unit.operators.title') }}
    p.operators__lead {{ t('unit.operators.lead') }}
    p.operators__meta(v-if="updatedText") {{ updatedText }}
    p.operators__meta {{ t('unit.operators.source') }}

  AsyncState(:loading="loading" :error="error" @retry="reload")
    .operators__body
      .operators__filters
        fieldset.operators__facet
          legend.operators__facet-title {{ t('unit.operators.typeLabel') }}
          .operators__pills
            button.pill(
              type="button"
              :class="{ 'is-active': !type }"
              @click="setParam('type', '')"
            ) {{ t('unit.operators.all') }}
              span.pill__count {{ typeCounts.all }}
            button.pill(
              type="button"
              :class="{ 'is-active': type === 'organic' }"
              @click="setParam('type', 'organic')"
            ) {{ t('unit.operators.organic') }}
              span.pill__count {{ typeCounts.organic }}
            button.pill(
              type="button"
              :class="{ 'is-active': type === 'tap' }"
              @click="setParam('type', 'tap')"
            ) {{ t('unit.operators.tap') }}
              span.pill__count {{ typeCounts.tap }}

        fieldset.operators__facet(v-if="cityCounts.length || city")
          legend.operators__facet-title {{ t('unit.operators.cityLabel') }}
          .operators__pills
            button.pill(
              type="button"
              :class="{ 'is-active': !city }"
              @click="setParam('city', '')"
            ) {{ t('unit.operators.allCities') }}
            button.pill(
              v-for="[name, count] in visibleCities"
              :key="name"
              type="button"
              :class="{ 'is-active': city === name }"
              @click="setParam('city', city === name ? '' : name)"
            ) {{ name }}
              span.pill__count {{ count }}
            button.operators__more(
              v-if="cityCounts.length > visibleCities.length || showAllCities"
              type="button"
              @click="showAllCities = !showAllCities"
            ) {{ showAllCities ? t('unit.operators.less') : t('unit.operators.more') }}

        SearchField.operators__search(
          v-model="query"
          variant="plain"
          :label="t('unit.operators.searchLabel')"
          :placeholder="t('unit.operators.searchPlaceholder')"
        )

      .operators__bar
        p.operators__count(aria-live="polite") {{ t('unit.operators.count', { n: filtered.length }) }}
        label.operators__size
          span.visually-hidden {{ t('unit.operators.perPageLabel') }}
          select.operators__select(:value="perPage" @change="onPerPage")
            option(v-for="n in PER_PAGE_OPTIONS" :key="n" :value="n") {{ t('unit.operators.perPage', { n }) }}

      ul.operators__list
        li.operator-card(
          v-for="o in pageResult.items"
          :key="`${o.type}-${o.certNo || o.orgId || o.name}`"
        )
          h3.operator-card__name {{ o.name }}
          dl.operator-card__rows
            .operator-card__row
              dt {{ t('unit.operators.typeLabel') }}
              dd {{ t(`unit.operators.${o.type}`) }}
            .operator-card__row(v-if="o.city")
              dt {{ t('unit.operators.cityLabel') }}
              dd {{ o.city }}
            .operator-card__row(v-if="o.products")
              dt {{ t('unit.operators.products') }}
              dd {{ o.products }}
            .operator-card__row(v-if="o.certNo")
              dt {{ t('unit.operators.certNo') }}
              dd {{ o.certNo }}
            .operator-card__row(v-if="o.validDate")
              dt {{ t('unit.operators.validDate') }}
              dd {{ o.validDate }}
        li.operators__empty(v-if="!filtered.length") {{ t('unit.operators.empty') }}

      AppPager(
        v-if="pageResult.total > 1"
        v-model="page"
        :total="pageResult.total"
        :label="t('unit.operators.pagination')"
      )
</template>

<style scoped lang="scss">
.operators {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 8px;

  &__title {
    font-family: $f-serif;
    font-size: 24px;
    font-weight: 900;
    color: $c-ink;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__lead {
    font-size: 14px;
    line-height: 1.9;
    color: $c-text;
  }

  &__meta {
    font-size: 12px;
    color: $c-muted;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__filters {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid $c-line;
    background: $c-paper;
  }

  &__facet {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  &__facet-title {
    padding: 0 0 8px;
    font-size: 13px;
    font-weight: 700;
    color: $c-text;
  }

  &__pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__more {
    @include button-reset;
    padding: 7px 4px;
    font-size: 13px;
    color: $c-primary;
    @include focus-ring;
    @include hover {
      text-decoration: underline;
    }
  }

  &__search {
    max-width: 420px;
  }

  &__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  &__count {
    font-size: 14px;
    font-weight: 700;
    color: $c-ink;
  }

  &__select {
    padding: 7px 10px;
    border: 1px solid $c-line-2;
    background: $c-white;
    font-size: 13px;
    color: $c-text;
    @include focus-ring;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__empty {
    grid-column: 1 / -1;
    padding: 28px 0;
    text-align: center;
    color: $c-muted;
  }
}

.pill {
  @include button-reset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 12px;
  border: 1px solid $c-line-2;
  border-radius: 999px;
  background: $c-white;
  font-size: 13px;
  color: $c-text;
  @include focus-ring;
  @include hover {
    border-color: $c-primary;
    color: $c-primary;
  }

  &.is-active {
    border-color: $c-primary;
    background: $c-primary;
    color: $c-white;
  }

  &__count {
    font-family: $f-mono;
    font-size: 11px;
    opacity: 0.75;
  }
}

.operator-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid $c-line;
  background: $c-white;

  &__name {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.6;
    color: $c-ink;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    font-size: 13px;
  }

  &__row {
    display: flex;
    gap: 10px;

    dt {
      flex-shrink: 0;
      width: 64px;
      color: $c-muted;
    }

    dd {
      margin: 0;
      min-width: 0;
      color: $c-text;
      overflow-wrap: anywhere;
    }
  }
}
</style>
