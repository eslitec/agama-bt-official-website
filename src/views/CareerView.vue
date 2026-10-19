<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import { media } from '@/utils/media'

/**
 * 招募一律導向 104 企業頁：曝光與應徵流程都在 104，
 * 站內不再維護職缺與教育訓練清單（與舊站 career.php 的作法一致）。
 */
const RECRUIT_URL = 'https://www.104.com.tw/company/cq63bd4'

/** 「成大智研生活」的兩個職務，內容與照片沿用舊站 career.php */
const roles = [
  { key: 'admin', image: media.careerAdmin },
  { key: 'audit', image: media.careerAudit },
]

const { t } = useI18n()
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 36px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('career.eyebrow')" :title="t('career.title')")

    section.career-intro(v-reveal)
      h2.career-intro__title {{ t('career.introTitle') }}
      p.career-intro__body.pre-line {{ t('career.introBody') }}
      a.btn.btn--primary.btn--lg.career-intro__btn(
        :href="RECRUIT_URL"
        target="_blank"
        rel="noopener"
      )
        | {{ t('career.recruit') }} ↗
        span.visually-hidden {{ t('common.externalLink') }}
      p.career-intro__note {{ t('career.recruitNote') }}

    section.career-life(v-reveal)
      h2.career-life__title {{ t('career.lifeTitle') }}
      p.career-life__lead {{ t('career.lifeLead') }}
      p.career-life__body.pre-line {{ t('career.lifeBody') }}
      ul.career-life__items(v-reveal.stagger)
        li.career-role(v-for="r in roles" :key="r.key")
          img.career-role__img(
            :src="r.image"
            :alt="t(`career.roles.${r.key}.name`)"
            width="580"
            height="520"
            loading="lazy"
          )
          .career-role__text
            p.career-role__name {{ t(`career.roles.${r.key}.name`) }}
            p.career-role__slogan {{ t(`career.roles.${r.key}.slogan`) }}
</template>

<style scoped lang="scss">
.career-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;

  &__title {
    font-size: 26px;
    font-weight: 900;
    color: $c-primary-dark;

    @include below(sm) {
      font-size: 22px;
    }
  }

  &__body {
    max-width: 46em;
    line-height: 2;
    color: $c-text;
  }

  // 按鈕是這頁唯一的行動點，給它比一般按鈕更大的點擊範圍
  &__btn {
    min-width: 220px;

    @include below(sm) {
      width: 100%;
      min-width: 0;
    }
  }

  &__note {
    max-width: 40em;
    font-size: 13px;
    line-height: 1.9;
    color: $c-text;
    overflow-wrap: anywhere;
  }
}

.career-life {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 24px;
  background: $c-sand;
  text-align: center;

  @include below(sm) {
    padding: 28px 16px;
  }

  &__title {
    font-size: 24px;
    font-weight: 900;
    color: $c-primary-dark;

    @include below(sm) {
      font-size: 20px;
    }
  }

  &__lead {
    font-size: 17px;
    font-weight: 700;
    color: $c-primary;
  }

  &__body {
    max-width: 44em;
    line-height: 2;
    color: $c-text;
  }

  // 兩張職務照並排，手機改一欄
  &__items {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 760px;
    margin-top: 10px;

    @include below(sm) {
      grid-template-columns: 1fr;
    }
  }
}

.career-role {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid $c-line;
  background: $c-white;
  text-align: left;

  &__img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 29 / 26;
    object-fit: cover;
  }

  &__text {
    padding: 16px 18px 20px;
  }

  &__name {
    font-size: 17px;
    font-weight: 900;
    color: $c-primary-dark;
  }

  &__slogan {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.8;
    color: $c-text;
  }
}
</style>
