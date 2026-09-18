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
    h1.admin-list__title {{ t('admin.news.title') }}
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
      li.admin-table__row(v-for="n in shown" :key="n.id" :data-id="n.id")
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
.admin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(24px, 4.5vw, 30px);
    font-weight: 900;
    color: $c-ink;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__summary {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: $c-muted;
  }

  &__target {
    padding: 10px 12px;
    background: $c-sand;
    color: $c-ink;
    overflow-wrap: anywhere;
  }
}

.segmented {
  display: inline-flex;
  border: 1px solid $c-line-2;
  background: $c-white;

  &__item {
    position: relative;
    display: flex;
    cursor: pointer;

    & + & {
      border-left: 1px solid $c-line-2;
    }
  }

  &__input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }

  &__text {
    padding: 12px 16px;
    font-size: 14px;
    color: $c-text;
    white-space: nowrap;
  }

  &__input:checked + &__text {
    background: $c-primary;
    color: $c-paper;
    font-weight: 700;
  }

  &__input:focus-visible + &__text {
    outline: 2px solid $c-primary;
    outline-offset: 2px;
  }
}

.admin-table {
  border: 1px solid $c-line;
  background: $c-white;

  &__body {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__row {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr) 64px auto;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid $c-line-soft;

    &--head {
      padding-block: 10px;
      background: $c-sand;
      font-size: 12px;
      font-weight: 700;
      color: $c-muted;
    }

    @include below(md) {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'date badge'
        'main main'
        'actions actions';
      gap: 6px 12px;
      padding: 14px 16px;

      &--head {
        display: none;
      }
    }
  }

  &__date {
    font-family: $f-display;
    font-size: 13px;
    font-weight: 700;
    color: $c-primary;

    @include below(md) {
      grid-area: date;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    @include below(md) {
      grid-area: main;
    }
  }

  &__title {
    font-size: 14px;
    line-height: 1.7;
    color: $c-ink;
    overflow-wrap: anywhere;
    @include hover {
      color: $c-primary;
      text-decoration: underline;
    }
  }

  &__meta {
    font-size: 12px;
    color: $c-muted;
    overflow-wrap: anywhere;
  }

  &__actions {
    display: flex;
    gap: 8px;

    @include below(md) {
      grid-area: actions;
      padding-top: 4px;
    }
  }

  .badge {
    @include below(md) {
      grid-area: badge;
      justify-self: end;
    }
  }

  &__empty {
    padding: 32px;
    text-align: center;
    font-size: 14px;
    color: $c-muted;
  }
}

.badge {
  display: inline-flex;
  justify-content: center;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  &--on {
    background: #e8f3f3;
    color: $c-primary-dark;
  }

  &--off {
    background: $c-danger-bg;
    color: $c-danger;
  }
}
</style>
