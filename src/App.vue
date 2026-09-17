<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import TopBar from '@/components/layout/TopBar.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import ScrollProgress from '@/components/layout/ScrollProgress.vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useAuthStore } from '@/stores/auth'
import { applyRouteMeta } from '@/router'

const { t } = useI18n()
const route = useRoute()
const { locale } = storeToRefs(usePreferencesStore())

// 切換語系時同步頁面標題
watch(locale, () => applyRouteMeta(route))

// 在後台時登入逾時或權杖失效：導向登入頁並提示重新登入
const auth = useAuthStore()
const router = useRouter()
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn || !route.meta.requiresAdmin) return
    void router.replace({ name: 'login', query: { redirect: route.fullPath, expired: '1' } })
  },
)

// 英文介面瀏覽只有中文資料的頁面時提示
const showZhNotice = computed(() => locale.value !== 'zh-TW' && route.meta.zhContent)
</script>

<template lang="pug">
.app
  a.skip-link(href="#main") {{ t('common.skip') }}
  ScrollProgress
  TopBar
  SiteHeader
  main#main.app__main(tabindex="-1")
    p.app__lang-notice(v-if="showZhNotice" role="note") {{ t('common.zhOnly') }}
    RouterView
  SiteFooter
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $c-paper;
  color: $c-ink;

  &__main {
    display: flex;
    flex-direction: column;
    outline: 0;
  }

  &__lang-notice {
    margin: 0;
    padding: 10px $gutter;
    background: #fbf5e6;
    border-bottom: 1px solid #efe1b8;
    text-align: center;
    font-size: 13px;
    color: #6b5316;
  }
}
</style>
