<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import SearchField from '@/components/common/SearchField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminDownloadsStore } from '@/stores/adminDownloads'
import { takeAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { groupAdminDownloads, matchesDownload } from '@/utils/admin-downloads'
import type { AdminDownloadItem, MoveDir } from '@/types/models'

type Visibility = 'all' | 'visible' | 'hidden'

const { t } = useI18n()
const store = useAdminDownloadsStore()
const { run, messageOf } = useAdminRequest()

const loading = ref(false)
const loadError = ref('')
const notice = ref(takeAdminFlash())

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { items } = await run(adminApi.listDownloads)
    store.setAll(items)
  } catch (e) {
    loadError.value = messageOf(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

const query = ref('')
const visibility = ref<Visibility>('all')
const visibilityOptions: Visibility[] = ['all', 'visible', 'hidden']
watch([query, visibility], () => (moveError.value = ''))

const filtered = computed(() =>
  store.items.filter(
    (d) =>
      matchesDownload(d, query.value) &&
      (visibility.value === 'all' || (visibility.value === 'visible' ? d.visible : !d.visible)),
  ),
)
/** 依分類編號分組顯示，順序沿用試算表的列順序 */
const groups = computed(() => groupAdminDownloads(filtered.value))

/* 排序 */
const moving = ref(0)
const moveError = ref('')

async function move(item: AdminDownloadItem, dir: MoveDir): Promise<void> {
  if (moving.value) return
  moving.value = item.id
  moveError.value = ''
  try {
    const { items } = await run((token) => adminApi.moveDownload(token, item.id, dir))
    store.setAll(items)
    clearSheetCache()
  } catch (e) {
    moveError.value = messageOf(e)
  } finally {
    moving.value = 0
  }
}

/* 刪除 */
const target = ref<AdminDownloadItem | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function askDelete(item: AdminDownloadItem): void {
  deleteError.value = ''
  target.value = item
}

async function confirmDelete(): Promise<void> {
  const item = target.value
  if (!item || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await run((token) => adminApi.deleteDownload(token, item.id))
    store.remove(item.id)
    clearSheetCache()
    target.value = null
    notice.value = t('admin.downloads.deleted')
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
    h1.admin-list__title {{ t('admin.downloads.title') }}
    RouterLink.btn.btn--primary(:to="{ name: 'adminDownloadNew' }")
      MIcon(name="add" :size="18")
      | {{ t('admin.downloads.add') }}
  p.form-alert.form-alert--success(v-if="notice" role="status") {{ notice }}
  p.admin-list__lead {{ t('admin.downloads.lead') }}

  .admin-list__toolbar
    SearchField(
      v-model="query"
      variant="plain"
      :label="t('admin.downloads.searchLabel')"
      :placeholder="t('admin.downloads.searchPlaceholder')"
    )
    .segmented(role="radiogroup" :aria-label="t('admin.news.filterLabel')")
      label.segmented__item(v-for="v in visibilityOptions" :key="v")
        input.segmented__input(
          v-model="visibility"
          type="radio"
          name="dl-visibility"
          :value="v"
        )
        span.segmented__text {{ t(`admin.news.filters.${v}`) }}

  p.form-alert(v-if="loadError" role="alert")
    | {{ loadError }}
    |
    button.text-link(type="button" @click="load") {{ t('common.retry') }}
  p.form-alert(v-if="moveError" role="alert") {{ moveError }}

  .admin-list__summary(aria-live="polite")
    span {{ t('admin.downloads.count', { count: filtered.length }) }}
    span.admin-list__loading(v-if="loading") {{ t('common.loading') }}

  template(v-if="store.loaded")
    section.admin-group(v-for="g in groups" :key="g.n")
      h2.admin-group__title
        span.admin-group__n {{ g.n }}
        | {{ g.title }}
      .admin-table
        ul.admin-table__body
          li.admin-table__row(v-for="d in g.items" :key="d.id" :data-id="d.id")
            span.admin-table__date {{ d.ext }}
            .admin-table__main
              RouterLink.admin-table__title(
                :to="{ name: 'adminDownloadEdit', params: { id: d.id } }"
              ) {{ d.name }}
              a.admin-table__meta(:href="d.href" target="_blank" rel="noopener noreferrer") {{ d.href }}
            span.badge(:class="d.visible ? 'badge--on' : 'badge--off'")
              | {{ d.visible ? t('admin.news.visible') : t('admin.news.hidden') }}
            .admin-table__actions
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving"
                :aria-label="t('admin.downloads.moveUp', { name: d.name })"
                @click="move(d, 'up')"
              )
                MIcon(name="arrow_upward" :size="16")
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving"
                :aria-label="t('admin.downloads.moveDown', { name: d.name })"
                @click="move(d, 'down')"
              )
                MIcon(name="arrow_downward" :size="16")
              RouterLink.btn.btn--outline.btn--sm(
                :to="{ name: 'adminDownloadEdit', params: { id: d.id } }"
                :aria-label="t('admin.downloads.editLabel', { name: d.name })"
              )
                MIcon(name="edit" :size="16")
                | {{ t('admin.news.edit') }}
              button.btn.btn--danger.btn--sm(
                type="button"
                :aria-label="t('admin.downloads.deleteLabel', { name: d.name })"
                @click="askDelete(d)"
              )
                MIcon(name="delete" :size="16")
                | {{ t('admin.news.delete') }}
    p.admin-table__empty(v-if="!filtered.length") {{ t('admin.downloads.empty') }}

  ConfirmDialog(
    :open="!!target"
    :title="t('admin.downloads.deleteTitle')"
    :confirm-text="deleting ? t('admin.news.deleting') : t('admin.news.deleteConfirm')"
    :cancel-text="t('admin.cancel')"
    :busy="deleting"
    :error="deleteError"
    danger
    @confirm="confirmDelete"
    @cancel="target = null"
  )
    p.admin-list__target(v-if="target")
      strong {{ target.ext }}
      |
      | {{ target.name }}
    p {{ t('admin.downloads.deleteBody') }}
</template>

<style scoped lang="scss">
/* 共用樣式在 src/styles/_admin.scss；此頁第一欄是格式而非日期 */
.admin-table__row {
  grid-template-columns: 56px minmax(0, 1fr) 64px auto;
}

.admin-table__date {
  font-size: 12px;
  letter-spacing: 0.04em;
}

.admin-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  & + & {
    margin-top: 8px;
  }

  &__title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: $c-ink;
  }

  &__n {
    font-family: $f-display;
    font-size: 13px;
    color: $c-primary;
  }
}
</style>
