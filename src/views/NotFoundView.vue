<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'

const { t } = useI18n()
</script>

<template lang="pug">
.page.l-section
  .not-found.l-container
    MIcon.not-found__icon(name="travel_explore" :size="56")
    span.not-found__code 404
    h1.not-found__title {{ t('notFound.title') }}
    p.not-found__lead {{ t('notFound.lead') }}
    RouterLink.btn.btn--primary(:to="{ name: 'home' }") {{ t('notFound.home') }}
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 96px;
  text-align: center;

  &__icon {
    color: $c-accent-soft;
  }

  &__code {
    font-family: $f-display;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: $c-primary;
  }

  &__title {
    font-family: $f-serif;
    font-size: 30px;
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    margin-bottom: 12px;
    font-size: 14px;
    color: $c-muted;
  }
}
</style>
