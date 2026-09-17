<script setup lang="ts">
import { computed } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const tabs = computed(() => [
  {
    key: 'news',
    to: { name: 'adminNews' },
    label: t('admin.tabNews'),
    active: String(route.name ?? '').startsWith('adminNews'),
  },
  {
    key: 'account',
    to: { name: 'adminAccount' },
    label: t('admin.tabAccount'),
    active: route.name === 'adminAccount',
  },
])

/** 先離開後台（編輯中有未儲存內容時可取消），再清除登入狀態 */
async function onLogout(): Promise<void> {
  const failure = await router.push({ name: 'home' })
  if (!isNavigationFailure(failure)) auth.logout()
}
</script>

<template lang="pug">
.page.l-section.admin
  .page__inner.l-container
    .admin-bar
      .admin-bar__brand
        span.admin-bar__eyebrow {{ t('admin.eyebrow') }}
        span.admin-bar__title {{ t('admin.title') }}
      .admin-bar__user
        span.admin-bar__name {{ t('admin.signedInAs', { name: auth.username }) }}
        button.text-link(type="button" @click="onLogout") {{ t('nav.logout') }}
    nav.admin-tabs(:aria-label="t('admin.menu')")
      RouterLink.admin-tabs__link(
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        :class="{ 'is-active': tab.active }"
        :aria-current="tab.active ? 'page' : undefined"
      ) {{ tab.label }}
    RouterView
</template>

<style scoped lang="scss">
.admin {
  --page-gap: 20px;
  padding-top: 32px;
}

.admin-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 20px;

  &__brand {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: $c-ink;
  }

  &__user {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 13px;
    color: $c-muted;
  }

  &__name {
    overflow-wrap: anywhere;
  }
}

.admin-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid $c-line;

  &__link {
    padding: 10px 16px;
    border-bottom: 3px solid transparent;
    font-size: 14px;
    color: $c-text;
    white-space: nowrap;
    @include hover {
      color: $c-primary;
    }

    &.is-active {
      border-bottom-color: $c-primary;
      font-weight: 700;
      color: $c-primary-dark;
    }
  }
}
</style>
