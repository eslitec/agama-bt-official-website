<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import SearchField from '@/components/common/SearchField.vue'
import FarmIcon from '@/components/common/FarmIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useQueryParam } from '@/composables/useQueryParam'
import { fetchFarms } from '@/api'
import { filterFarms } from '@/utils/filters'

const { t } = useI18n()
const query = useQueryParam('q', [])
const { data: farms, loading, error, reload } = useAsyncData(fetchFarms, [])
const filtered = computed(() => filterFarms(farms.value, query.value))
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 26px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('farm.eyebrow')" :title="t('farm.title')" :lead="t('farm.lead')")
    .farm-toolbar
      SearchField(
        v-model="query"
        variant="plain"
        :label="t('farm.searchLabel')"
        :placeholder="t('farm.searchPlaceholder')"
      )
      span.farm-toolbar__count(aria-live="polite") {{ t('farm.count', { count: filtered.length }) }}
    AsyncState(:loading="loading" :error="error" @retry="reload")
      ul.farm-grid(v-if="filtered.length" v-reveal.stagger)
        li.farm-card(v-for="f in filtered" :key="f.name")
          .farm-card__head
            span.farm-card__icon
              FarmIcon(:icon="f.icon")
            span.farm-card__title
              h2.farm-card__name(lang="zh-Hant-TW") {{ f.name }}
              span.farm-card__city(lang="zh-Hant-TW") {{ f.city }}
          dl.farm-card__info
            .farm-card__row(v-if="f.tel")
              dt {{ t('farm.tel') }}
              dd
                a(:href="`tel:${f.tel.replaceAll('-', '')}`") {{ f.tel }}
            .farm-card__row(v-if="f.fax")
              dt {{ t('farm.fax') }}
              dd {{ f.fax }}
            .farm-card__row(v-if="f.email")
              dt {{ t('farm.email') }}
              dd.farm-card__email
                a(:href="`mailto:${f.email}`") {{ f.email }}
            .farm-card__row
              dt {{ t('farm.address') }}
              dd(lang="zh-Hant-TW") {{ f.city }}{{ f.addr }}
      EmptyState(v-else :message="t('farm.empty')")
</template>

<style scoped lang="scss">
.farm-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  &__count {
    font-size: 13px;
    color: $c-muted;
  }
}

.farm-grid {
  @include auto-grid(340px, 16px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.farm-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px;
  border: 1px solid $c-line;
  background: $c-white;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
  @include hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 26px rgba(18, 50, 56, 0.12);
  }

  @include below(sm) {
    padding: 22px 18px;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: $c-sand;
    color: $c-primary;
  }

  &__title {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__name {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.5;
    color: $c-ink;
  }

  &__city {
    font-size: 12px;
    color: $c-muted;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    font-size: 13px;
    color: $c-text;
  }

  &__row {
    display: flex;
    gap: 10px;

    dt {
      min-width: 52px;
      color: $c-muted;
    }

    dd {
      margin: 0;
    }

    a {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      color: $c-primary;
    }
  }

  &__email {
    word-break: break-all;
  }
}
</style>
