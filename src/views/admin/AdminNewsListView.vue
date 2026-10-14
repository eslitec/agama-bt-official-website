<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import SearchField from '@/components/common/SearchField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminNewsStore } from '@/stores/adminNews'
import { takeAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { filterAdminNews } from '@/utils/admin-news'
import type { AdminNewsItem } from '@/types/models'

const PAGE_SIZE = 30
type Visibility = 'all' | 'visible' | 'hidden'

const { t } = useI18n()
const store = useAdminNewsStore()
const { run, messageOf } = useAdminRequest()

const loading = ref(false)
const loadError = ref('')
const notice = ref(takeAdminFlash())

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { items } = await run(adminApi.listNews)
    store.setAll(items)
  } catch (e) {
    loadError.value = messageOf(e)
  } finally {
    loading.value = false
  }
}
// 有暫存時先顯示，同時在背景重新讀取（其他管理者可能也改過）
onMounted(load)

const query = ref('')
const visibility = ref<Visibility>('all')
const visibilityOptions: Visibility[] = ['all', 'visible', 'hidden']
const limit = ref(PAGE_SIZE)
watch([query, visibility], () => (limit.value = PAGE_SIZE))

const filtered = computed(() => filterAdminNews(store.items, query.value, visibility.value))
const shown = computed(() => filtered.value.slice(0, limit.value))
const remaining = computed(() => filtered.value.length - shown.value.length)

/* 刪除 */
const target = ref<AdminNewsItem | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function askDelete(item: AdminNewsItem): void {
  deleteError.value = ''
  target.value = item
}

async function confirmDelete(): Promise<void> {
  const item = target.value
  if (!item || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await run((token) => adminApi.deleteNews(token, item.id))
    store.remove(item.id)
    clearSheetCache()
    target.value = null
    notice.value = t('admin.news.deleted')
  } catch (e) {
    if (e instanceof adminApi.AdminApiError && e.code === 'NOT_FOUND') store.remove(item.id)
    deleteError.value = messageOf(e)
  } finally {
    deleting.value = false
  }
}
</script>

<template lang="pug">
section.admin-list
  header.admin-list__head
    .admin-list__heading
      h1.admin-list__title {{ t('admin.news.title') }}
      RouterLink.admin-list__public(:to="{ name: 'news' }" target="_blank")
        | {{ t('admin.viewPublic') }}
        span.visually-hidden {{ t('common.externalLink') }}
    RouterLink.btn.btn--primary(:to="{ name: 'adminNewsNew' }")
      MIcon(name="add" :size="18")
      | {{ t('admin.news.add') }}
  p.form-alert.form-alert--success(v-if="notice" role="status") {{ notice }}

  .admin-list__toolbar
    SearchField(
      v-model="query"
      variant="plain"
      :label="t('admin.news.searchLabel')"
      :placeholder="t('admin.news.searchPlaceholder')"
    )
    .segmented(role="radiogroup" :aria-label="t('admin.news.filterLabel')")
      label.segmented__item(v-for="v in visibilityOptions" :key="v")
        input.segmented__input(
          v-model="visibility"
          type="radio"
          name="visibility"
          :value="v"
        )
        span.segmented__text {{ t(`admin.news.filters.${v}`) }}

  p.form-alert(v-if="loadError" role="alert")
    | {{ loadError }}
    |
    button.text-link(type="button" @click="load") {{ t('common.retry') }}

  .admin-list__summary(aria-live="polite")
    span {{ t('admin.news.count', { count: filtered.length }) }}
    span.admin-list__loading(v-if="loading") {{ t('common.loading') }}

  .admin-table(v-if="store.loaded")
    .admin-table__row.admin-table__row--head(aria-hidden="true")
      span {{ t('admin.news.colDate') }}
      span {{ t('admin.news.colTitle') }}
      span {{ t('admin.news.colVisible') }}
      span {{ t('admin.news.colActions') }}
    ul.admin-table__body
      li.admin-table__row(
        v-for="n in shown"
        :key="n.id"
        :class="{ 'admin-table__row--off': !n.visible }"
        :data-id="n.id"
      )
        time.admin-table__date(:datetime="n.date.replaceAll('.', '-')") {{ n.date }}
        .admin-table__main
          RouterLink.admin-table__title(:to="{ name: 'adminNewsEdit', params: { id: n.id } }") {{ n.title }}
          span.admin-table__meta
            | ID {{ n.id }}
            template(v-if="n.no") ・{{ t('admin.news.noNumber', { no: n.no }) }}
            template(v-if="n.src") ・{{ n.src }}
        span.badge(:class="n.visible ? 'badge--on' : 'badge--off'")
          | {{ n.visible ? t('admin.news.visible') : t('admin.news.hidden') }}
        .admin-table__actions
          RouterLink.btn.btn--outline.btn--sm(
            :to="{ name: 'adminNewsEdit', params: { id: n.id } }"
            :aria-label="t('admin.news.editLabel', { title: n.title })"
          )
            MIcon(name="edit" :size="16")
            | {{ t('admin.news.edit') }}
          button.btn.btn--danger.btn--sm(
            type="button"
            :aria-label="t('admin.news.deleteLabel', { title: n.title })"
            @click="askDelete(n)"
          )
            MIcon(name="delete" :size="16")
            | {{ t('admin.news.delete') }}
    p.admin-table__empty(v-if="!filtered.length") {{ t('admin.news.empty') }}
  button.btn.btn--outline.btn--block(
    v-if="remaining > 0"
    type="button"
    @click="limit += PAGE_SIZE"
  )
    | {{ t('admin.news.showMore', { count: remaining }) }}

  ConfirmDialog(
    :open="!!target"
    :title="t('admin.news.deleteTitle')"
    :confirm-text="deleting ? t('admin.news.deleting') : t('admin.news.deleteConfirm')"
    :cancel-text="t('admin.cancel')"
    :busy="deleting"
    :error="deleteError"
    danger
    @confirm="confirmDelete"
    @cancel="target = null"
  )
    p.admin-list__target(v-if="target")
      strong {{ target.date }}
      |
      | {{ target.title }}
    p {{ t('admin.news.deleteBody') }}
</template>

<style scoped lang="scss">
/* 後台列表樣式（.admin-list / .segmented / .admin-table / .badge）在 src/styles/_admin.scss */
</style>
