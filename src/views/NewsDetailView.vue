<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import NewsList from '@/components/common/NewsList.vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import AsyncState from '@/components/common/AsyncState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { fetchNewsList } from '@/api'
import { applyPageMeta, excerpt } from '@/utils/seo'

const props = defineProps<{ id: number }>()

const { t, locale } = useI18n()
const route = useRoute()
const { data: news, loading, error, reload } = useAsyncData(fetchNewsList, [])

const item = computed(() => news.value.find((n) => n.id === props.id))
const others = computed(() => news.value.filter((n) => n.id !== props.id).slice(0, 5))
const lightbox = ref<string | null>(null)

// 標題以【公告】開頭的是公司自己的公告，其餘為轉知主管機關訊息
const badge = computed(() =>
  item.value?.title.startsWith('【公告】')
    ? t('newsDetail.badgeAnnounce')
    : t('newsDetail.badgeNotice'),
)

// 讓瀏覽器分頁與搜尋結果顯示消息標題
watch(
  [item, locale],
  () => {
    if (!item.value) return
    applyPageMeta({
      title: `${item.value.title}${t('site.titleSep')}${t('site.name')}`,
      description: excerpt(`${item.value.date} ${item.value.src} ${item.value.title}`),
      path: route.fullPath,
    })
  },
  { flush: 'post', immediate: true },
)
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 24px")
  .page__inner.l-container.l-container--narrow
    nav.crumbs(:aria-label="t('newsDetail.breadcrumb')")
      ol.crumbs__list
        li: RouterLink(:to="{ name: 'home' }") {{ t('nav.home') }}
        li: RouterLink.crumbs__current-parent(:to="{ name: 'news' }") {{ t('nav.news') }}
        li(aria-current="page") {{ t('newsDetail.crumb') }}

    AsyncState(:loading="loading" :error="error" @retry="reload")
      article.news-article(v-if="item")
        header.news-article__meta
          span.news-article__badge {{ badge }}
          time.news-article__date(:datetime="item.date.replaceAll('.', '-')") {{ item.date }}
          i18n-t.news-article__src(keypath="newsDetail.metaSrc" tag="span" scope="global")
            template(#src)
              span(lang="zh-Hant-TW") {{ item.src }}
          span.news-article__src(v-if="item.no") {{ t('newsDetail.metaNo', { no: item.no }) }}
        h1.news-article__title(lang="zh-Hant-TW") {{ item.title }}
        hr.news-article__rule

        section.news-article__block(v-if="item.atts.length")
          h2.news-article__block-title {{ t('newsDetail.attachments') }}
          a.att-link(
            v-for="a in item.atts"
            :key="a.href + a.label"
            :href="a.href"
            target="_blank"
            rel="noopener"
          )
            MIcon(name="link" :size="20")
            span.att-link__label(lang="zh-Hant-TW") {{ a.label }}
            span.att-link__arrow(aria-hidden="true") ↗
            span.visually-hidden {{ t('common.externalLink') }}

        section.news-article__block(v-if="item.imgs?.length")
          h2.news-article__block-title {{ t('newsDetail.images', { count: item.imgs.length }) }}
          ul.img-grid
            li(v-for="(src, i) in item.imgs" :key="src")
              button.img-thumb(type="button" @click="lightbox = src")
                span.img-thumb__image(
                  :style="{ backgroundImage: `url(\'${src}\')` }"
                  aria-hidden="true"
                )
                span.img-thumb__caption
                  span {{ t('newsDetail.imagePage', { n: i + 1 }) }}
                  MIcon(name="zoom_in" :size="17")

        p.news-article__none(v-if="!item.atts.length && !item.imgs?.length") {{ t('newsDetail.noAttachments') }}

        .news-article__actions
          RouterLink.btn.btn--outline(:to="{ name: 'news' }") {{ t('newsDetail.back') }}
      EmptyState(v-else icon="search_off" :message="t('newsDetail.notFound')")

    section.news-others(v-if="others.length")
      h2.news-others__title {{ t('newsDetail.others') }}
      .news-others__box
        NewsList(:items="others" variant="boxed")

  ImageLightbox(v-model="lightbox")
</template>

<style scoped lang="scss">
.crumbs {
  padding-top: 40px;

  &__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: $c-muted;

    a {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
    }

    li + li::before {
      content: '／';
      margin-right: 8px;
    }
  }

  &__current-parent {
    color: $c-primary;
  }
}

.news-article {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 40px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(md) {
    padding: 26px 20px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px 12px;
    flex-wrap: wrap;
  }

  &__badge {
    background: $c-primary;
    color: $c-paper;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
  }

  &__date {
    font-family: $f-display;
    font-size: 13px;
    font-weight: 700;
    color: $c-primary;
  }

  &__src {
    font-size: 13px;
    color: $c-muted;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(21px, 3.4vw, 26px);
    font-weight: 900;
    line-height: 1.6;
    color: $c-ink;
    text-wrap: pretty;
    overflow-wrap: anywhere;
  }

  &__rule {
    margin: 0;
    border: 0;
    height: 1px;
    background: $c-line-soft;
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__block-title {
    font-size: 14px;
    font-weight: 700;
    color: $c-ink;
  }

  &__none {
    font-size: 14px;
    line-height: 1.9;
    color: $c-muted;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 6px;

    .btn {
      padding-inline: 24px;
    }
  }
}

.att-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
  border: 1px solid $c-line;
  background: $c-paper;
  font-size: 14px;
  color: $c-ink;
  transition:
    background 0.2s,
    border-color 0.2s;
  @include hover {
    color: $c-ink;
    background: $c-sand-hover;
    border-color: $c-primary;
  }

  :deep(.m-icon) {
    color: $c-primary;
  }

  &__label {
    flex: 1;
    line-height: 1.6;
  }

  &__arrow {
    color: $c-muted;
  }
}

.img-grid {
  @include auto-grid(180px, 12px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.img-thumb {
  @include button-reset;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid $c-line;
  background: $c-paper;
  cursor: zoom-in;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  @include focus-ring;
  @include hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(18, 50, 56, 0.16);
  }

  &__image {
    display: block;
    width: 100%;
    height: 240px;
    background-color: $c-sand;
    background-size: cover;
    background-position: top center;
  }

  &__caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    font-size: 12px;
    color: $c-muted;

    :deep(.m-icon) {
      color: $c-primary;
    }
  }
}

.news-others {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-size: 15px;
    font-weight: 900;
    color: $c-ink;
  }

  &__box {
    border: 1px solid $c-line;
    background: $c-white;
  }
}
</style>
