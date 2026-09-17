import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { applyPageMeta, NOINDEX } from '@/utils/seo'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export type NavKey =
  'home' | 'about' | 'how' | 'fee' | 'unit' | 'download' | 'news' | 'farm' | 'link'

declare module 'vue-router' {
  interface RouteMeta {
    /** i18n key，用於 <title> */
    title?: string
    /** i18n key，用於 meta description（未設定時用網站預設描述） */
    description?: string
    /** 內容資料只有中文（英文介面時顯示提示） */
    zhContent?: boolean
    /** 對應主選單哪一項要亮起 */
    nav?: NavKey
    /** 已登入者不需要進入的頁面（登入、註冊） */
    guestOnly?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { nav: 'home', description: 'seo.home', zhContent: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'about.title', nav: 'about', description: 'about.p1' },
  },
  {
    path: '/how',
    name: 'how',
    component: () => import('@/views/HowView.vue'),
    meta: { title: 'how.title', nav: 'how', description: 'seo.how', zhContent: true },
  },
  {
    path: '/fee',
    name: 'fee',
    component: () => import('@/views/FeeView.vue'),
    meta: { title: 'fee.title', nav: 'fee', description: 'fee.lead', zhContent: true },
  },
  {
    path: '/units',
    name: 'unit',
    component: () => import('@/views/UnitView.vue'),
    meta: { title: 'unit.title', nav: 'unit', description: 'unit.lead', zhContent: true },
  },
  {
    path: '/units/:cid(\\d+)',
    name: 'unitDetail',
    component: () => import('@/views/UnitDetailView.vue'),
    props: (route) => ({ cid: Number(route.params.cid) }),
    meta: { title: 'unit.title', nav: 'unit', description: 'unit.lead', zhContent: true },
  },
  {
    path: '/download',
    name: 'download',
    component: () => import('@/views/DownloadView.vue'),
    meta: {
      title: 'download.title',
      nav: 'download',
      description: 'seo.download',
      zhContent: true,
    },
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: 'news.title', nav: 'news', description: 'seo.news', zhContent: true },
  },
  {
    path: '/news/:id(\\d+)',
    name: 'newsDetail',
    component: () => import('@/views/NewsDetailView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'news.title', nav: 'news', description: 'seo.news', zhContent: true },
  },
  {
    path: '/farms',
    name: 'farm',
    component: () => import('@/views/FarmView.vue'),
    meta: { title: 'farm.title', nav: 'farm', description: 'farm.lead', zhContent: true },
  },
  {
    path: '/links',
    name: 'link',
    component: () => import('@/views/LinkView.vue'),
    meta: { title: 'link.title', nav: 'link', description: 'seo.links', zhContent: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'login.title', description: 'login.lead', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'register.title', description: 'seo.register', guestOnly: true },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: 'contact.title', description: 'seo.contact' },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: { title: 'footer.privacy', description: 'privacy.lead' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'notFound.title' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    // 同頁只改 query 時（例如搜尋字）不跳回頂端；分頁切換則回頂端
    if (to.name === from.name && to.query.page === from.query.page) return false
    return { top: 0 }
  },
})

/** 依路由 meta 更新標題、描述與 canonical；頁面可再以 applyPageMeta 覆寫（例如消息標題） */
export const applyRouteMeta = (to: RouteLocationNormalizedLoaded): void => {
  const { t } = i18n.global
  const site = t('site.name')
  applyPageMeta({
    title: `${to.meta.title ? t(to.meta.title) : site}${t('site.titleSep')}${to.meta.title ? site : t('site.homeTitle')}`,
    description: t(to.meta.description ?? 'seo.home'),
    path: to.fullPath,
  })
  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (NOINDEX || to.name === 'notFound') {
    const el = robots ?? document.head.appendChild(document.createElement('meta'))
    el.setAttribute('name', 'robots')
    el.setAttribute('content', NOINDEX ? 'noindex, nofollow' : 'noindex')
  } else robots?.remove()
}

router.beforeEach((to) => {
  if (to.meta.guestOnly && useAuthStore().isLoggedIn) return { name: 'home' }
  return true
})

router.afterEach((to) => applyRouteMeta(to))

export default router
