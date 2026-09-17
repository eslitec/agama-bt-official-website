<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'
import { useAuthStore } from '@/stores/auth'
import { externalUrls } from '@/utils/media'
import type { AppLocale } from '@/i18n'

const { t } = useI18n()
const prefs = usePreferencesStore()
const { locale } = storeToRefs(prefs)
const { isLoggedIn } = storeToRefs(useAuthStore())

const locales: { value: AppLocale; label: string }[] = [
  { value: 'zh-TW', label: '中' },
  { value: 'en', label: 'EN' },
]
</script>

<template lang="pug">
.topbar
  .topbar__inner.l-container
    span.topbar__tagline {{ t('site.tagline') }}
    .topbar__actions
      RouterLink(:to="{ name: 'contact' }") {{ t('topbar.feedback') }}
      a(
        v-if="isLoggedIn"
        :href="externalUrls.memberModify"
        target="_blank"
        rel="noopener"
      ) {{ t('topbar.member') }}
      RouterLink(v-else :to="{ name: 'login' }") {{ t('topbar.member') }}
      .topbar__lang(role="group" :aria-label="t('topbar.langLabel')")
        button.topbar__lang-btn(
          v-for="l in locales"
          :key="l.value"
          type="button"
          :class="{ 'is-active': locale === l.value }"
          :aria-pressed="locale === l.value"
          :lang="l.value"
          @click="prefs.setLocale(l.value)"
        ) {{ l.label }}
</template>

<style scoped lang="scss">
.topbar {
  background: $c-primary-dark;
  color: $c-on-dark-2;
  padding: 8px $gutter;
  display: flex;
  justify-content: center;

  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px 16px;
    font-size: 12px;
    flex-wrap: wrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 14px;

    a {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      @include hover {
        color: $c-white;
        text-decoration: underline;
      }
    }
  }

  &__lang {
    display: flex;
    border: 1px solid #3e8d95;
  }

  &__lang-btn {
    @include button-reset;
    min-width: 32px;
    min-height: 24px;
    padding: 3px 8px;
    font-size: 12px;
    @include focus-ring($c-paper);

    &.is-active {
      background: $c-paper;
      color: $c-primary-dark;
    }
  }

  @include below(md) {
    &__tagline {
      display: none;
    }

    &__inner {
      justify-content: flex-end;
    }
  }
}
</style>
