<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { onKeyStroke, useEventListener, useMediaQuery } from '@vueuse/core'
import MIcon from '@/components/common/MIcon.vue'
import type { NavKey } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useScrollProgress } from '@/composables/useScrollProgress'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)
const { condensed } = useScrollProgress()

const NAV: NavKey[] = ['home', 'about', 'how', 'fee', 'unit', 'download', 'news', 'farm', 'link']
const activeKey = computed(() => route.meta.nav)

/**
 * 版面密度：
 * - full：品牌、選單（登入後加上後台、登出）同一列
 * - dense：同一列但縮小選單間距
 * - tight：同一列、再縮小間距並隱藏品牌英文副標（約 1024–1180px）
 * - compact：放不下一列（或 < 1024px）時收合成「選單」按鈕
 */
type Density = 'full' | 'dense' | 'tight' | 'compact'
const isNarrow = useMediaQuery('(max-width: 1023.98px)')
const density = ref<Density>('full')
const isCompact = computed(() => isNarrow.value || density.value === 'compact')
const inner = ref<HTMLElement | null>(null)

const overflowing = (): boolean => {
  const el = inner.value
  return !!el && el.scrollWidth > el.clientWidth + 1
}

async function fit(): Promise<void> {
  if (isNarrow.value) return
  for (const d of ['full', 'dense', 'tight', 'compact'] as const) {
    density.value = d
    await nextTick()
    if (d === 'compact' || !overflowing()) return
  }
}

let raf = 0
const scheduleFit = (): void => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => void fit())
}

onMounted(() => {
  scheduleFit()
  // 字型載入後文字寬度會改變，需重新量測
  void document.fonts?.ready.then(scheduleFit)
})
useEventListener('resize', scheduleFit, { passive: true })
watch([locale, isLoggedIn, isNarrow], scheduleFit)

const headerClass = computed(() => [
  `site-header--${isCompact.value ? 'compact' : density.value}`,
  { 'is-condensed': condensed.value, 'site-header--latin': locale.value !== 'zh-TW' },
])

const mobileOpen = ref(false)
const navOpen = computed(() => !isCompact.value || mobileOpen.value)

watch(
  () => route.fullPath,
  () => (mobileOpen.value = false),
)
watch(isCompact, (v) => {
  if (!v) mobileOpen.value = false
})
onKeyStroke('Escape', () => (mobileOpen.value = false))

/** 在後台時先離開（編輯中有未儲存內容時可取消），再清除登入狀態 */
async function onLogout(): Promise<void> {
  if (route.meta.requiresAdmin) {
    const failure = await router.push({ name: 'home' })
    if (isNavigationFailure(failure)) return
  }
  auth.logout()
}
</script>

<template lang="pug">
header.site-header(:class="headerClass")
  .site-header__inner.l-container(ref="inner")
    RouterLink.site-header__brand(:to="{ name: 'home' }")
      MIcon.site-header__logo(name="eco" :size="26")
      span.site-header__brand-text
        span.site-header__brand-name {{ t('site.name') }}
        span.site-header__brand-en {{ t('site.nameEn') }}

    button.site-header__toggle(
      v-if="isCompact"
      type="button"
      :aria-expanded="mobileOpen"
      aria-controls="site-nav"
      @click="mobileOpen = !mobileOpen"
    )
      MIcon(:name="mobileOpen ? 'close' : 'menu'" :size="24")
      span.site-header__toggle-text {{ t('nav.menu') }}

    nav#site-nav.site-header__nav(v-show="navOpen" :aria-label="t('nav.mainNav')")
      ul.site-header__list
        li(v-for="key in NAV" :key="key")
          RouterLink.site-header__link(
            :to="{ name: key }"
            :class="{ 'is-active': activeKey === key }"
            :aria-current="activeKey === key ? 'page' : undefined"
          ) {{ t(`nav.${key}`) }}
      .site-header__admin(v-if="isLoggedIn")
        RouterLink.site-header__login(:to="{ name: 'adminNews' }") {{ t('nav.admin') }}
        button.site-header__logout(type="button" @click="onLogout") {{ t('nav.logout') }}
      //- 未登入時顯示管理者登入入口（頁尾也有一個）
      .site-header__admin(v-else)
        RouterLink.site-header__login(:to="{ name: 'login' }" rel="nofollow") {{ t('footer.adminLogin') }}
</template>

<style scoped lang="scss">
.site-header {
  position: sticky;
  top: 0;
  z-index: $z-header;
  display: flex;
  justify-content: center;
  padding: 12px $gutter;
  background: $c-primary;
  box-shadow: 0 2px 14px rgba(20, 40, 30, 0.18);
  transition:
    padding 0.3s $ease-out,
    background-color 0.3s $ease-out;

  &.is-condensed {
    padding-block: 6px;
    background: $c-primary-dark;
  }

  // 品牌｜選單＋登入 同一列
  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: nowrap;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    @include hover {
      color: inherit;
    }
  }

  &__logo {
    color: $c-on-dark;
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  &__brand-name {
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: $c-paper;
    white-space: nowrap;
  }

  &__brand-en {
    font-family: $f-display;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $c-on-dark-3;
    white-space: nowrap;
  }

  &__toggle {
    @include button-reset;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid rgba(248, 245, 238, 0.5);
    border-radius: 4px;
    color: $c-paper;
    font-size: 14px;
    @include focus-ring($c-paper);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: nowrap;
  }

  &__list {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: nowrap;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    display: block;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    color: $c-nav-text;
    white-space: nowrap;
    transition: background 0.2s;
    @include focus-ring($c-paper);
    @include hover {
      color: $c-nav-text;
      background: rgba(248, 245, 238, 0.2);
    }

    &.is-active {
      font-weight: 700;
      color: $c-primary-dark;
      background: $c-paper;
    }
  }

  &__admin {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  &__logout {
    @include button-reset;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 14px;
    color: $c-nav-text;
    white-space: nowrap;
    @include focus-ring($c-paper);
    @include hover {
      background: rgba(248, 245, 238, 0.2);
    }
  }

  &__login {
    @include button-reset;
    background: $c-paper;
    color: $c-primary-dark;
    padding: 9px 18px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    transition: transform 0.2s;
    @include focus-ring($c-paper);
    @include hover {
      color: $c-primary-dark;
      transform: translateY(-1px);
    }
  }

  // 英文品牌名較長：折成兩行，並省略重複的英文副標
  &--latin {
    .site-header__brand-name {
      max-width: 240px;
      font-size: 17px;
      letter-spacing: 0.02em;
      line-height: 1.2;
      white-space: normal;
    }

    .site-header__brand-en {
      display: none;
    }
  }

  // 同一列但空間較緊
  &--dense {
    .site-header__nav {
      gap: 10px;
    }

    .site-header__link {
      padding-inline: 8px;
    }

    .site-header__login {
      padding-inline: 14px;
    }
  }

  &--tight {
    .site-header__brand-en {
      display: none;
    }

    .site-header__nav {
      gap: 8px;
    }

    .site-header__link {
      padding-inline: 6px;
    }

    .site-header__login {
      padding-inline: 12px;
    }
  }

  // 放不下一列：收合選單
  &--compact {
    .site-header__inner {
      flex-wrap: wrap;
      row-gap: 12px;
    }

    .site-header__nav {
      flex-basis: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      padding: 8px 0 6px;
      border-top: 1px solid rgba(248, 245, 238, 0.2);
      max-height: calc(100vh - 80px);
      overflow-y: auto;
    }

    .site-header__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 4px;
    }

    .site-header__link {
      padding: 10px 13px;
    }

    .site-header__admin {
      padding-top: 4px;
    }
  }
}

// 手機：品牌與「選單」按鈕維持同一列
.site-header--compact {
  @include below(sm) {
    padding-block: 10px;

    .site-header__brand-en {
      display: none;
    }
  }

  @media (max-width: 359.98px) {
    .site-header__brand-name {
      font-size: 17px;
    }

    .site-header__toggle {
      padding-inline: 10px;
    }

    .site-header__toggle-text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  }
}
</style>
