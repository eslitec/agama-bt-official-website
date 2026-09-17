<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import { media } from '@/utils/media'

const { t, tm, rt } = useI18n()
const values = computed(() => (tm('about.values') as unknown as string[]).map((v) => rt(v)))
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 36px")
  .page__inner.l-container
    PageHeading(:eyebrow="t('about.eyebrow')" :title="t('about.title')")
    .about
      .about__text
        p.about__para {{ t('about.p1') }}
        p.about__para {{ t('about.p2') }}
        section.about__scope
          h2.about__scope-title {{ t('about.scopeTitle') }}
          p.about__scope-body
            | {{ t('about.scopeOrganic') }}
            br
            | {{ t('about.scopeTraceable') }}
      .about__aside
        span.about__image(:style="{ backgroundImage: `url(${media.about})` }" aria-hidden="true")
        ul.about__values(v-reveal.stagger)
          li.about__value(v-for="v in values" :key="v")
            strong.about__value-name {{ v }}
            span.about__value-label {{ t('about.valueLabel') }}
</template>

<style scoped lang="scss">
.about {
  @include auto-grid(300px, 28px);
  align-items: start;

  &__text,
  &__aside {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__aside {
    gap: 16px;
  }

  &__para {
    font-size: 16px;
    line-height: 2.1;
    color: $c-text;
    text-wrap: pretty;
  }

  &__scope {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 26px;
    background: $c-sand;
  }

  &__scope-title {
    font-size: 17px;
    font-weight: 900;
    color: $c-ink;
  }

  &__scope-body {
    font-size: 14px;
    line-height: 2;
    color: $c-text;
  }

  &__image {
    min-height: 220px;
    background-size: cover;
    background-position: center;
  }

  &__values {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__value {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px;
    border: 1px solid $c-line;
    background: $c-white;
  }

  &__value-name {
    font-size: 22px;
    font-weight: 900;
    color: $c-primary;

    @include below(sm) {
      font-size: 19px;
    }
  }

  &__value-label {
    font-size: 12px;
    color: $c-muted;
  }
}
</style>
