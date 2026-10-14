<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import SearchField from '@/components/common/SearchField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminCareersStore } from '@/stores/adminCareers'
import { takeAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import type { AdminCareerItem, CareerKind, MoveDir } from '@/types/models'

const KINDS: CareerKind[] = ['job', 'training']
type Visibility = 'all' | 'visible' | 'hidden'

const { t } = useI18n()
const store = useAdminCareersStore()
const { run, messageOf } = useAdminRequest()

const loading = ref(false)
const loadError = ref('')
const notice = ref(takeAdminFlash())

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { items } = await run(adminApi.listCareers)
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

const matches = (c: AdminCareerItem): boolean => {
  const q = query.value.trim().toLowerCase()
  const byText =
    !q ||
    [c.title, c.titleEn, c.place, c.nature, c.period, c.body].join(' ').toLowerCase().includes(q)
  const byVisible =
    visibility.value === 'all' || (visibility.value === 'visible' ? c.visible : !c.visible)
  return byText && byVisible
}

const filtered = computed(() => store.items.filter(matches))
const sections = computed(() =>
  KINDS.map((kind) => ({ kind, items: filtered.value.filter((c) => c.kind === kind) })),
)

/** 與資料下載同樣的理由：篩選時上下移動會和看不到的那一筆交換（見 admin.downloads.sortLocked） */
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

async function move(item: AdminCareerItem, dir: MoveDir): Promise<void> {
  if (moving.value || !canSort.value) return
  moving.value = item.id
  moveError.value = ''
  try {
    const { items } = await run((token) => adminApi.moveCareer(token, item.id, dir))
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
const target = ref<AdminCareerItem | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function askDelete(item: AdminCareerItem): void {
  deleteError.value = ''
  target.value = item
}

async function confirmDelete(): Promise<void> {
  const item = target.value
  if (!item || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await run((token) => adminApi.deleteCareer(token, item.id))
    store.remove(item.id)
    clearSheetCache()
    target.value = null
    notice.value = t('admin.careers.deleted')
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
      h1.admin-list__title {{ t('admin.careers.title') }}
      RouterLink.admin-list__public(:to="{ name: 'career' }" target="_blank" rel="noopener")
        | {{ t('admin.viewPublic') }}
        span.visually-hidden {{ t('common.externalLink') }}
    RouterLink.btn.btn--primary(:to="{ name: 'adminCareerNew' }")
      MIcon(name="add" :size="18")
      | {{ t('admin.careers.add') }}
  p.form-alert.form-alert--success(v-if="notice" role="status") {{ notice }}
  p.admin-list__lead {{ t('admin.careers.lead') }}

  .admin-list__toolbar
    SearchField(
      v-model="query"
      variant="plain"
      :label="t('admin.careers.searchLabel')"
      :placeholder="t('admin.careers.searchPlaceholder')"
    )
    .segmented(role="radiogroup" :aria-label="t('admin.news.filterLabel')")
      label.segmented__item(v-for="v in visibilityOptions" :key="v")
        input.segmented__input(
          v-model="visibility"
          type="radio"
          name="career-visibility"
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
    span {{ t('admin.careers.count', { count: filtered.length }) }}
    span.admin-list__loading(v-if="loading") {{ t('common.loading') }}

  template(v-if="store.loaded")
    section.admin-group(v-for="s in sections" :key="s.kind")
      h2.admin-group__title {{ t(`careers.kinds.${s.kind}`) }}
      .admin-table
        ul.admin-table__body
          li.admin-table__row(
            v-for="(c, i) in s.items"
            :key="c.id"
            :class="{ 'admin-table__row--off': !c.visible, 'is-moved': moved === c.id }"
            :data-id="c.id"
          )
            .admin-table__main
              RouterLink.admin-table__title(
                :to="{ name: 'adminCareerEdit', params: { id: c.id } }"
              ) {{ c.title }}
              span.admin-table__meta
                | ID {{ c.id }}
                template(v-if="c.place") ・{{ c.place }}
                template(v-if="c.nature") ・{{ c.nature }}
                template(v-if="c.period") ・{{ c.period }}
            span.badge(:class="c.visible ? 'badge--on' : 'badge--off'")
              | {{ c.visible ? t('admin.news.visible') : t('admin.news.hidden') }}
            .admin-table__actions
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving || !canSort || i === 0"
                :aria-label="t('admin.careers.moveUp', { name: c.title })"
                @click="move(c, 'up')"
              )
                MIcon(name="arrow_upward" :size="16")
              button.btn.btn--outline.btn--sm.btn--icon(
                type="button"
                :disabled="!!moving || !canSort || i === s.items.length - 1"
                :aria-label="t('admin.careers.moveDown', { name: c.title })"
                @click="move(c, 'down')"
              )
                MIcon(name="arrow_downward" :size="16")
              RouterLink.btn.btn--outline.btn--sm(
                :to="{ name: 'adminCareerEdit', params: { id: c.id } }"
                :aria-label="t('admin.careers.editLabel', { name: c.title })"
              )
                MIcon(name="edit" :size="16")
                | {{ t('admin.news.edit') }}
              button.btn.btn--danger.btn--sm(
                type="button"
                :aria-label="t('admin.careers.deleteLabel', { name: c.title })"
                @click="askDelete(c)"
              )
                MIcon(name="delete" :size="16")
                | {{ t('admin.news.delete') }}
        p.admin-table__empty(v-if="!s.items.length") {{ t('admin.careers.emptyKind') }}

  ConfirmDialog(
    :open="!!target"
    :title="t('admin.careers.deleteTitle')"
    :confirm-text="deleting ? t('admin.news.deleting') : t('admin.news.deleteConfirm')"
    :cancel-text="t('admin.cancel')"
    :busy="deleting"
    :error="deleteError"
    danger
    @confirm="confirmDelete"
    @cancel="target = null"
  )
    p.admin-list__target(v-if="target") {{ target.title }}
    p {{ t('admin.careers.deleteBody') }}
</template>

<style scoped lang="scss">
/* 共用樣式在 src/styles/_admin.scss；此頁沒有第一欄的日期 */
.admin-table__row {
  grid-template-columns: minmax(0, 1fr) 64px auto;
}

.admin-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  & + & {
    margin-top: 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: $c-ink;
  }
}
</style>
