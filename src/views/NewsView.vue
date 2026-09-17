<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import SearchField from '@/components/common/SearchField.vue'
import NewsList from '@/components/common/NewsList.vue'
import AppPager from '@/components/common/AppPager.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useQueryParam } from '@/composables/useQueryParam'
import { fetchNewsList } from '@/api'
import { filterNews } from '@/utils/filters'
import { paginate, parsePage } from '@/utils/pagination'

const NEWS_PER_PAGE = 15

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const newsQuery = useQueryParam('q')
const { data: news, loading, error, reload } = useAsyncData(fetchNewsList, [])

const filtered = computed(() => filterNews(news.value, newsQuery.value))
const paged = computed(() => paginate(filtered.value, parsePage(route.query.page), NEWS_PER_PAGE))

const page = computed({
  get: () => paged.value.page,
  set: (n: number) =>
    router.push({ query: { ...route.query, page: n > 1 ? String(n) : undefined } }),
})
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 24px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('news.eyebrow')" :title="t('news.title')")
    .news-toolbar
      SearchField(
        v-model="newsQuery"
        variant="plain"
        :label="t('news.searchLabel')"
        :placeholder="t('news.searchPlaceholder')"
      )
      span.news-toolbar__summary(aria-live="polite")
        | {{ t('news.summary', { count: filtered.length, page: paged.page, total: paged.total }) }}
    AsyncState(:loading="loading" :error="error" @retry="reload")
      .news-box
        NewsList(:items="paged.items" variant="boxed")
        p.news-box__empty(v-if="!filtered.length") {{ t('news.empty') }}
      AppPager(v-if="paged.total > 1" v-model="page" :total="paged.total")
</template>

<style scoped lang="scss">
.news-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  &__summary {
    font-size: 13px;
    color: $c-muted;
  }
}

.news-box {
  border: 1px solid $c-line;
  background: $c-white;

  &__empty {
    padding: 32px;
    text-align: center;
    font-size: 14px;
    color: $c-muted;
  }
}
</style>
