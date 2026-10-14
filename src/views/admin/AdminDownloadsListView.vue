<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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

/**
 * 有搜尋或篩選時不能調整順序：上下移動是和「同分類的前後一筆」交換，
 * 那一筆可能不在目前的篩選結果裡，畫面會完全沒反應，但順序其實已經變了。
 */
const canSort = computed(() => !query.value.trim() && visibility.value === 'all')

/* 排序 */
const moving = ref(0)
const moveError = ref('')
/** 剛移動的那一筆：短暫標示，讓使用者看得出來是哪一列動了 */
const moved = ref(0)
let movedTimer: ReturnType<typeof setTimeout> | undefined

/** 清單重畫後焦點會掉，接著連按好幾下很難用：把焦點放回同一筆的同一顆按鈕 */
async function restoreFocus(id: number, dir: MoveDir): Promise<void> {
  await nextTick()
  const row = document.querySelector(`[data-id="${id}"]`)
  const btn = row?.querySelectorAll('button')[dir === 'up' ? 0 : 1]
  if (btn instanceof HTMLButtonElement && !btn.disabled) btn.focus()
  moved.value = id
  clearTimeout(movedTimer)
  movedTimer = setTimeout(() => (moved.value = 0), 1600)
}

async function move(item: AdminDownloadItem, dir: MoveDir): Promise<void> {
  if (moving.value || !canSort.value) return
  moving.value = item.id
  moveError.value = ''
  try {
    const { items } = await run((token) => adminApi.moveDownload(token, item.id, dir))
    store.setAll(items)
    clearSheetCache()
    // 先解除 moving，否則按鈕還是 disabled，焦點放不回去
    moving.value = 0
    await restoreFocus(item.id, dir)
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
    .admin-list__heading
      h1.admin-list__title {{ t('admin.downloads.title') }}
      RouterLink.admin-list__public(:to="{ name: 'download' }" target="_blank")
        | {{ t('admin.viewPublic') }}
        span.visually-hidden {{ t('common.externalLink') }}
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
  p.admin-list__hint(v-if="store.loaded && !canSort && filtered.length") {{ t('admin.downloads.sortLocked') }}

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
          li.admin-table__row(
            v-for="(d, i) in g.items"
            :key="d.id"
            :class="{ 'admin-table__row--off': !d.visible, 'is-moved': moved === d.id }"
            :data-id="d.id"
          )
            span.admin-table__date {{ d.ext }}
            .admin-table__main
              RouterLink.admin-table__title(
                :to="{ name: 'adminDownloadEdit', params: { id: d.id } }"
              ) {{ d.name }}
              a.admin-table__meta.admin-table__link(
                :href="d.href"
                :title="d.href"
                target="_blank"
                rel="noopener noreferrer"
              ) {{ d.href }}
            span.badge(:class="d.visible ? 'badge--on' : 'badge--off'")
              | {{ d.visible ? t('admin.news.visible') : t('admin.news.hidden') }}
            .admin-table__actions
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving || !canSort || i === 0"
                :aria-label="t('admin.downloads.moveUp', { name: d.name })"
                @click="move(d, 'up')"
              )
                MIcon(name="arrow_upward" :size="16")
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving || !canSort || i === g.items.length - 1"
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
    .admin-table(v-if="!filtered.length")
      p.admin-table__empty {{ t('admin.downloads.empty') }}

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

/* 網址只是給管理者辨識用，不要讓它換行把清單撐長（完整網址放 title） */
.admin-table__link {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-wrap: normal;
  @include hover {
    color: $c-primary;
    text-decoration: underline;
  }
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
