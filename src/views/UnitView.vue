<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import PageHeading from '@/components/common/PageHeading.vue'
import SearchField from '@/components/common/SearchField.vue'
import InfoPanel from '@/components/common/InfoPanel.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useQueryParam } from '@/composables/useQueryParam'
import { fetchUnits } from '@/api'
import { filterUnits } from '@/utils/filters'
import { externalUrls } from '@/utils/media'

const { t } = useI18n()
const unitQuery = useQueryParam('q', [])
const { data: units, loading, error, reload } = useAsyncData(fetchUnits, [])
const filtered = computed(() => filterUnits(units.value, unitQuery.value))
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 26px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('unit.eyebrow')" :title="t('unit.title')" :lead="t('unit.lead')")
    SearchField.unit-search(
      v-model="unitQuery"
      variant="boxed"
      :label="t('unit.searchLabel')"
      :placeholder="t('unit.searchPlaceholder')"
    )
    AsyncState(:loading="loading" :error="error" @retry="reload")
      ul.unit-grid(v-reveal.stagger aria-live="polite")
        li(v-for="u in filtered" :key="u.cid")
          RouterLink.unit-card(
            :to="{ name: 'unitDetail', params: { cid: u.cid } }"
            :style="{ '--cat-color': u.color }"
          )
            MIcon.unit-card__icon(:name="u.icon" :size="36")
            span.unit-card__name(lang="zh-Hant-TW") {{ u.name }}
            span.unit-card__desc(lang="zh-Hant-TW") {{ u.desc }}
            span.unit-card__cta {{ t('unit.viewList') }}
        li.unit-grid__empty(v-if="!filtered.length") {{ t('unit.empty') }}
    InfoPanel(:title="t('unit.portalTitle')")
      a.text-link(:href="externalUrls.traceableLookup" target="_blank" rel="noopener") {{ t('unit.portalTraceable') }}
      a.text-link(:href="externalUrls.organicLookup" target="_blank" rel="noopener") {{ t('unit.portalOrganic') }}
</template>

<style scoped lang="scss">
.unit-search {
  max-width: 560px;

  :deep(.search-field__input) {
    padding: 14px 16px;
  }

  :deep(.search-field__button) {
    padding: 14px 20px;
  }
}

.unit-grid {
  @include auto-grid(320px, 16px);
  margin: 0;
  padding: 0;
  list-style: none;

  &__empty {
    font-size: 14px;
    color: $c-muted;
  }
}

.unit-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 26px;
  border: 1px solid $c-line;
  border-top: 4px solid var(--cat-color);
  background: $c-white;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
  @include hover {
    color: inherit;
    transform: translateY(-4px);
    box-shadow: $shadow-card;
  }

  &__icon {
    color: var(--cat-color);
  }

  &__name {
    font-size: 18px;
    font-weight: 700;
    color: $c-ink;
  }

  &__desc {
    font-size: 13px;
    line-height: 1.85;
    color: $c-text-2;
  }

  &__cta {
    font-size: 13px;
    color: $c-primary;
  }
}
</style>
