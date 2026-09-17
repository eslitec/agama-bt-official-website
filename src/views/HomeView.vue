<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResizeObserver } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import NewsList from '@/components/common/NewsList.vue'
import FileLink from '@/components/common/FileLink.vue'
import SearchField from '@/components/common/SearchField.vue'
import CountStat from '@/components/common/CountStat.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocalized } from '@/composables/useLocalized'
import { fetchNewsList, fetchProcessSteps, fetchQuickFiles, fetchUnits } from '@/api'
import { filterNews, filterUnits } from '@/utils/filters'
import { heroVideo, media } from '@/utils/media'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const { t } = useI18n()
const { pick, langOf } = useLocalized()
const router = useRouter()
// 首頁的搜尋只做快速預覽；按 Enter 或「查看全部」會帶關鍵字到列表頁（網址 ?q=）
const newsQuery = ref('')
const unitQuery = ref('')
const searchTo = (name: 'news' | 'unit', q: string) => ({
  name,
  query: q.trim() ? { q: q.trim() } : {},
})
const goSearch = (name: 'news' | 'unit', q: string) => router.push(searchTo(name, q))

const { data: news } = useAsyncData(fetchNewsList, [])
const { data: units } = useAsyncData(fetchUnits, [])
const { data: steps } = useAsyncData(fetchProcessSteps, [])
const { data: quickFiles } = useAsyncData(fetchQuickFiles, [])

const top5 = computed(() => news.value.slice(0, 5))
const filteredNews = computed(() => filterNews(news.value, newsQuery.value))
const filteredUnits = computed(() => filterUnits(units.value, unitQuery.value))

const activeStep = ref(0)
const currentStep = computed(() => steps.value[activeStep.value])

const heroTitleLines = computed(() => t('home.heroTitle').split('\n'))
// 主視覺影片：靜音自動播放一次，播完停在最後一格；使用者偏好減少動態時只顯示第一格畫面
const heroVideoEl = ref<HTMLVideoElement | null>(null)
const reduceMotion = ref(false)
// 手機版：影片只鋪在文案區，查詢卡片放在影片下方，避免直式畫面把 16:9 影片放大到模糊
const heroCopyEl = ref<HTMLElement | null>(null)
const heroMediaH = ref<number | null>(null)
useResizeObserver(heroCopyEl, () => {
  const el = heroCopyEl.value
  if (el) heroMediaH.value = el.offsetTop + el.offsetHeight + 72
})
const heroStyle = computed(() =>
  heroMediaH.value ? { '--hero-media-h': `${heroMediaH.value}px` } : undefined,
)

onMounted(() => {
  const v = heroVideoEl.value
  if (!v) return
  reduceMotion.value = prefersReducedMotion()
  v.muted = true // 行動裝置自動播放需要 muted 屬性
  if (reduceMotion.value) v.pause()
  else void v.play().catch(() => undefined)
})
const bandBg = computed(() => ({
  backgroundImage: `linear-gradient(rgba(20,40,30,.34), rgba(20,40,30,.34)), url("${media.fieldBanner}")`,
}))
</script>

<template lang="pug">
.home
  //- ── 主視覺 ────────────────────────────────
  section.home-hero.l-section(:style="heroStyle")
    video.home-hero__video(
      ref="heroVideoEl"
      :poster="heroVideo.poster"
      :autoplay="!reduceMotion"
      muted
      playsinline
      preload="auto"
      disablepictureinpicture
      aria-hidden="true"
      tabindex="-1"
    )
      source(:src="heroVideo.webm" type="video/webm")
      source(:src="heroVideo.mp4" type="video/mp4")
    .home-hero__overlay(aria-hidden="true")
    .home-hero__inner.l-container
      .home-hero__copy(ref="heroCopyEl")
        span.home-hero__eyebrow {{ t('home.heroEyebrow') }}
        h1.home-hero__title
          template(v-for="(line, i) in heroTitleLines" :key="i")
            br(v-if="i > 0")
            | {{ line }}
        p.home-hero__lead {{ t('home.heroLead') }}
        .home-hero__cta
          RouterLink.home-hero__btn.home-hero__btn--solid(:to="{ name: 'how' }") {{ t('home.ctaHow') }}
          RouterLink.home-hero__btn.home-hero__btn--glass(:to="{ name: 'fee' }") {{ t('home.ctaFee') }}

      section.unit-finder(aria-labelledby="unit-finder-title")
        h2#unit-finder-title.unit-finder__title {{ t('home.unitSearchTitle') }}
        p.unit-finder__lead {{ t('home.unitSearchLead') }}
        SearchField(
          v-model="unitQuery"
          variant="boxed"
          :label="t('home.unitSearchTitle')"
          :placeholder="t('home.unitSearchPlaceholder')"
          @submit="goSearch('unit', $event)"
        )
        ul.unit-finder__list(aria-live="polite")
          li(v-for="u in filteredUnits" :key="u.cid")
            RouterLink.unit-finder__item(:to="{ name: 'unitDetail', params: { cid: u.cid } }")
              MIcon(:name="u.icon" :size="19" :style="{ color: u.color }")
              span.unit-finder__name(:lang="langOf(u.nameEn)") {{ pick(u.name, u.nameEn) }}
              span.unit-finder__chev(aria-hidden="true") ›
          li.unit-finder__empty(v-if="units.length && !filteredUnits.length") {{ t('unit.empty') }}
        RouterLink.text-link.unit-finder__all(:to="searchTo('unit', unitQuery)") {{ t('home.unitSearchAll') }}

  //- ── 最新公告帶 ──────────────────────────────
  section.home-notice.l-section(aria-labelledby="home-notice-badge")
    .home-notice__inner.l-container
      .home-notice__head
        h2#home-notice-badge.home-notice__badge {{ t('home.noticeBadge') }}
        span.home-notice__lead {{ t('home.noticeLead') }}
        span.home-notice__rule(aria-hidden="true")
        RouterLink.home-notice__more(:to="{ name: 'news' }") {{ t('common.more') }}
      NewsList(:items="top5" variant="notice")

  //- ── 數據 ──────────────────────────────────
  section.home-stats.l-section
    .home-stats__grid.l-container(v-reveal.stagger)
      CountStat(
        :key="`c${units.length}`"
        :value="units.length"
        :label="t('home.stats.categories')"
      )
      CountStat(
        :key="`s${steps.length}`"
        :value="steps.length"
        :suffix="t('home.stats.stagesSuffix')"
        :label="t('home.stats.stages')"
      )
      CountStat(:value="1" :suffix="t('home.stats.auditSuffix')" :label="t('home.stats.audit')")
      CountStat(
        :value="3"
        :suffix="t('home.stats.validitySuffix')"
        :label="t('home.stats.validity')"
      )

  //- ── 驗證類別（圖片底）──────────────────────
  section.home-band.l-section(:style="bandBg")
    .home-band__inner.l-container
      SectionTitle(:title="t('home.categoriesTitle')" tone="on-image")
      ul.home-band__grid(v-reveal.stagger)
        li(v-for="u in units" :key="u.cid")
          RouterLink.cat-card(
            :to="{ name: 'unitDetail', params: { cid: u.cid } }"
            :style="{ '--cat-color': u.color }"
          )
            MIcon.cat-card__icon(:name="u.icon" :size="36")
            span.cat-card__body
              span.cat-card__name(:lang="langOf(u.nameEn)") {{ pick(u.name, u.nameEn) }}
              span.cat-card__desc(:lang="langOf(u.descEn)") {{ pick(u.desc, u.descEn) }}
            span.cat-card__arrow(aria-hidden="true") →

  //- ── 驗證流程 ───────────────────────────────
  section.home-process.l-section
    .home-process__inner.l-container
      SectionTitle(:title="t('home.processTitle')")
        RouterLink.text-link(:to="{ name: 'how' }") {{ t('home.processLink') }}
      .home-process__steps(v-reveal.stagger role="tablist" :aria-label="t('home.processTitle')")
        button.step-chip(
          v-for="(s, i) in steps"
          :id="`step-tab-${i}`"
          :key="s.n"
          type="button"
          role="tab"
          :class="{ 'is-active': i === activeStep }"
          :aria-selected="i === activeStep"
          aria-controls="step-panel"
          @click="activeStep = i"
        )
          span.step-chip__num {{ t('common.step', { n: s.n }) }}
          span.step-chip__title(:lang="langOf(s.titleEn)") {{ pick(s.title, s.titleEn) }}
      #step-panel.home-process__panel(
        v-if="currentStep"
        role="tabpanel"
        :aria-labelledby="`step-tab-${activeStep}`"
      )
        .home-process__panel-head
          span.home-process__panel-num {{ t('common.step', { n: currentStep.n }) }}
          span.home-process__panel-title(:lang="langOf(currentStep.titleEn)")
            | {{ pick(currentStep.title, currentStep.titleEn) }}
        p.home-process__panel-body(:lang="langOf(currentStep.bodyEn)")
          | {{ pick(currentStep.body, currentStep.bodyEn) }}

  //- ── 最新消息＋常用下載 ─────────────────────
  section.home-split.l-section
    .home-split__grid.l-container
      .home-split__col
        SectionTitle(:title="t('home.newsTitle')")
          SearchField(
            v-model="newsQuery"
            variant="compact"
            :label="t('news.searchLabel')"
            :placeholder="t('home.newsSearchPlaceholder')"
            @submit="goSearch('news', $event)"
          )
        div(aria-live="polite")
          NewsList(:items="filteredNews.slice(0, 5)" variant="plain")
          p.home-split__empty(v-if="news.length && !filteredNews.length") {{ t('news.empty') }}
        RouterLink.text-link(:to="searchTo('news', newsQuery)")
          | {{ newsQuery.trim() ? t('home.newsResults', { count: filteredNews.length }) : t('home.newsAll') }}
      .home-split__col
        SectionTitle(:title="t('home.quickTitle')")
        FileLink(
          v-for="f in quickFiles"
          :key="f.href"
          v-bind="f"
          variant="card"
        )
        RouterLink.text-link(:to="{ name: 'download' }") {{ t('home.quickAll') }}

  //- ── 申請驗證＋聯絡 ─────────────────────────
  section.home-bottom.l-section
    .home-bottom__grid.l-container(v-reveal.stagger)
      .apply-card
        h2.apply-card__title {{ t('home.applyTitle') }}
        p.apply-card__lead {{ t('home.applyLead') }}
        RouterLink.btn.btn--primary.btn--block(:to="{ name: 'how' }") {{ t('home.ctaHow') }}
        RouterLink.apply-card__download(:to="{ name: 'download' }") {{ t('home.applyDownload') }}
      .contact-card
        span.contact-card__image(
          :style="{ backgroundImage: `url(${media.contact})` }"
          aria-hidden="true"
        )
        .contact-card__body
          h2.contact-card__title {{ t('home.contactTitle') }}
          address.contact-card__text
            | {{ t('site.company') }}
            br
            | {{ t('site.address') }}
            br
            | {{ t('home.contactNote') }}
          RouterLink.text-link(:to="{ name: 'contact' }") {{ t('home.contactLink') }}
</template>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
}

// ── 主視覺 ─────────────────────────────────
.home-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: 64px;
  background: $c-primary-dark;

  @include below(md) {
    padding-block: 40px;
  }

  &__video,
  &__overlay {
    position: absolute;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
  }

  &__video {
    object-fit: cover;
    object-position: center;
    pointer-events: none;
  }

  @include below(lg) {
    padding-bottom: 32px;
    background: $c-paper;

    &__video,
    &__overlay {
      bottom: auto;
      height: var(--hero-media-h, 100%);
    }
  }

  // 影片畫面偏亮，左側加深以確保白字可讀
  &__overlay {
    background:
      linear-gradient(
        90deg,
        rgba(10, 59, 64, 0.78) 0%,
        rgba(10, 59, 64, 0.52) 42%,
        rgba(10, 59, 64, 0.18) 100%
      ),
      linear-gradient(rgba(20, 40, 30, 0.08), rgba(20, 40, 30, 0.22));

    @include below(lg) {
      background: linear-gradient(rgba(10, 59, 64, 0.62), rgba(10, 59, 64, 0.72));
    }
  }

  &__inner {
    @include auto-grid(320px, 36px);
    align-items: center;
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__eyebrow {
    font-family: $f-display;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;

    @include below(sm) {
      letter-spacing: 0.08em;
    }
    color: #dce8d9;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 900;
    line-height: 1.34;
    color: $c-white;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
  }

  &__lead {
    max-width: 460px;
    font-size: 15px;
    line-height: 1.95;
    color: #eff3ec;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.45);
    text-wrap: pretty;
  }

  &__cta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__btn {
    padding: 15px 26px;
    font-size: 15px;
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      background 0.2s;
    @include focus-ring($c-paper);

    &--solid {
      background: $c-paper;
      color: $c-primary-dark;
      font-weight: 700;
      @include hover {
        color: $c-primary-dark;
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
      }
    }

    &--glass {
      padding-inline: 24px;
      background: rgba(36, 73, 61, 0.55);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(248, 245, 238, 0.6);
      color: $c-paper;
      @include hover {
        color: $c-paper;
        background: rgba(36, 73, 61, 0.85);
      }
    }
  }
}

.unit-finder {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  background: rgba(248, 245, 238, 0.92);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 40px rgba(20, 30, 22, 0.22);

  @include below(sm) {
    padding: 22px 18px;
  }

  &__title {
    font-size: 19px;
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    font-size: 13px;
    line-height: 1.75;
    color: $c-text-2;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 2px;
    border-bottom: 1px solid $c-line;
    font-size: 14px;
    color: $c-ink;
    transition:
      background 0.2s,
      padding-left 0.2s;
    @include hover {
      color: $c-ink;
      background: $c-sand-hover;
      padding-left: 8px;
    }
  }

  &__name {
    flex: 1;
  }

  &__chev {
    color: $c-muted;
  }

  &__empty {
    padding: 8px 0;
    font-size: 13px;
    color: $c-muted;
  }

  &__all {
    font-size: 13px;
    align-self: flex-start;
  }
}

// ── 最新公告帶 ─────────────────────────────
.home-notice {
  padding-block: 28px;
  background: $c-primary-dark;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  &__badge {
    background: $c-accent;
    color: $c-primary-deep;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
  }

  &__lead {
    font-size: 13px;
    color: $c-on-dark;
  }

  &__rule {
    height: 1px;
    flex: 1;
    min-width: 20px;
    background: $c-divider-dark;
  }

  &__more {
    border: 1px solid $c-accent;
    color: $c-paper;
    padding: 9px 20px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    transition:
      background 0.2s,
      color 0.2s;
    @include focus-ring($c-paper);
    @include hover {
      background: $c-accent;
      color: $c-primary-deep;
    }
  }
}

// ── 數據 ───────────────────────────────────
.home-stats {
  padding-block: 48px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;

    // 平板與手機 2×2，避免 3＋1 落單或 4 張全寬直排
    @include below(lg) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
  }
}

// ── 驗證類別 ───────────────────────────────
.home-band {
  padding-block: 56px;
  background-size: cover;
  background-position: center;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__grid {
    @include auto-grid(300px, 16px);
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.cat-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 26px;
  background: rgba(248, 245, 238, 0.88);
  backdrop-filter: blur(14px);
  border-top: 4px solid var(--cat-color);
  transition:
    transform 0.25s,
    box-shadow 0.25s,
    background 0.25s;
  @include hover {
    color: inherit;
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(20, 30, 22, 0.28);
    background: rgba(255, 253, 247, 0.97);
  }

  &__icon {
    color: var(--cat-color);
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 17px;
    font-weight: 700;
    color: $c-ink;
  }

  &__desc {
    font-size: 13px;
    color: $c-text-2;
  }

  &__arrow {
    color: $c-primary;
  }
}

// ── 驗證流程 ───────────────────────────────
.home-process {
  padding-top: 60px;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  &__steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 6px;
  }

  &__panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 26px;
    align-items: start;
    padding: 26px 30px;
    background: $c-sand;

    @include below(md) {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 22px 20px;
    }
  }

  &__panel-head {
    max-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__panel-num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-primary;
  }

  &__panel-title {
    font-size: 19px;
    font-weight: 700;
    color: $c-ink;
  }

  &__panel-body {
    font-size: 15px;
    line-height: 2;
    color: $c-text-2;
    text-wrap: pretty;
  }
}

.step-chip {
  @include button-reset;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 14px;
  border: 1px solid $c-line-2;
  background: $c-paper;
  color: $c-ink;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;
  @include focus-ring;
  @include hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 22px rgba(31, 42, 30, 0.14);
  }

  &__num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-muted;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
  }

  &.is-active {
    background: $c-primary;
    color: $c-paper;

    .step-chip__num {
      color: $c-on-dark;
    }
  }
}

// ── 最新消息＋常用下載 ─────────────────────
.home-split {
  padding-top: 60px;

  &__grid {
    @include auto-grid(320px, 32px);
    align-items: start;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__empty {
    padding: 22px 0;
    font-size: 14px;
    color: $c-muted;
  }
}

// ── 申請驗證＋聯絡 ─────────────────────────
.home-bottom {
  padding-block: 60px;

  &__grid {
    @include auto-grid(300px, 20px);
  }
}

.apply-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  border: 1px solid $c-line;
  background: $c-sand;

  &__title {
    font-size: 19px;
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    font-size: 13px;
    line-height: 1.85;
    color: $c-text-2;
  }

  &__download {
    padding: 13px;
    border: 1px solid $c-primary;
    color: $c-primary;
    font-size: 14px;
    text-align: center;
    transition:
      background 0.2s,
      color 0.2s;
    @include hover {
      background: $c-primary;
      color: $c-paper;
    }
  }
}

.contact-card {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid $c-line;
  background: $c-white;

  &__image {
    flex: 1 1 200px;
    min-height: 180px;
    background-size: cover;
    background-position: center;
  }

  &__body {
    flex: 2 1 280px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 28px;
  }

  &__title {
    font-size: 18px;
    font-weight: 900;
    color: $c-ink;
  }

  &__text {
    font-style: normal;
    font-size: 13px;
    line-height: 2;
    color: $c-text-2;
  }

  .text-link {
    font-size: 13px;
    margin-top: 4px;
  }
}
</style>
