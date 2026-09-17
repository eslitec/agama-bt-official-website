<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template lang="pug">
footer.site-footer
  .l-container
    .site-footer__grid
      .site-footer__col
        strong.site-footer__company {{ t('site.company') }}
        address.site-footer__text
          | {{ t('site.address') }}
          br
          | {{ t('site.values') }}
      nav.site-footer__col(:aria-label="t('footer.certification')")
        span.site-footer__label {{ t('footer.certification') }}
        RouterLink(:to="{ name: 'how' }") {{ t('nav.how') }}
        RouterLink(:to="{ name: 'fee' }") {{ t('nav.fee') }}
        RouterLink(:to="{ name: 'unit' }") {{ t('nav.unit') }}
      nav.site-footer__col(:aria-label="t('footer.resources')")
        span.site-footer__label {{ t('footer.resources') }}
        RouterLink(:to="{ name: 'download' }") {{ t('nav.download') }}
        RouterLink(:to="{ name: 'news' }") {{ t('nav.news') }}
        RouterLink(:to="{ name: 'link' }") {{ t('nav.link') }}
      nav.site-footer__col(:aria-label="t('footer.service')")
        span.site-footer__label {{ t('footer.service') }}
        RouterLink(:to="{ name: 'farm' }") {{ t('nav.farm') }}
        RouterLink(:to="{ name: 'contact' }") {{ t('topbar.feedback') }}
        RouterLink(:to="{ name: 'privacy' }") {{ t('footer.privacy') }}
        RouterLink.site-footer__admin(:to="{ name: 'login' }" rel="nofollow") {{ t('footer.adminLogin') }}
</template>

<style scoped lang="scss">
.site-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 40px $gutter;
  background: $c-primary-dark;
  color: $c-on-dark-5;

  &__grid {
    @include auto-grid(240px, 24px);
  }

  &__col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
    font-size: 13px;

    a {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      @include focus-ring($c-paper);
      @include hover {
        color: $c-white;
      }
    }
  }

  &__company {
    font-size: 16px;
    font-weight: 900;
    color: $c-paper;
  }

  &__text {
    font-style: normal;
    line-height: 1.95;
  }

  // 管理者入口：一般訪客用不到，降低存在感
  &__admin {
    font-size: 12px;
    opacity: 0.7;
  }

  &__label {
    font-family: $f-display;
    font-size: 12px;
    letter-spacing: 0.14em;
    color: $c-accent-soft;
  }
}
</style>
