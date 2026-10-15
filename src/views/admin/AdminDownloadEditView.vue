<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import FormField from '@/components/common/FormField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminDownloadsStore } from '@/stores/adminDownloads'
import { setAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { useFormErrors } from '@/composables/useFormErrors'
import { isBlank, isHttpUrl } from '@/utils/validators'
import type { AdminDownloadInput } from '@/types/models'

const props = defineProps<{
  /** 未提供時為新增 */
  id?: number
}>()

const { t } = useI18n()
const router = useRouter()
const store = useAdminDownloadsStore()
const { run, messageOf } = useAdminRequest()

const isNew = computed(() => props.id === undefined)
const heading = computed(() =>
  isNew.value ? t('admin.downloads.newTitle') : t('admin.downloads.editTitle'),
)

const ready = ref(false)
const form = reactive<AdminDownloadInput>({
  n: '',
  group: '',
  groupEn: '',
  name: '',
  nameEn: '',
  ext: '',
  href: '',
  visible: true,
})

const toInput = (): AdminDownloadInput => ({
  n: form.n.trim(),
  group: form.group.trim(),
  groupEn: form.groupEn.trim(),
  name: form.name.trim(),
  nameEn: form.nameEn.trim(),
  ext: form.ext
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, ''),
  href: form.href.trim(),
  visible: form.visible,
})

const snapshot = ref('')
const dirty = computed(() => ready.value && JSON.stringify(toInput()) !== snapshot.value)

/** 已經存在的分類：新增時可直接挑一個，不必重打分類編號與名稱 */
const knownGroups = computed(() => {
  const seen = new Map<string, { n: string; group: string; groupEn: string }>()
  for (const d of store.items)
    if (!seen.has(d.n)) seen.set(d.n, { n: d.n, group: d.group, groupEn: d.groupEn })
  return [...seen.values()]
})

/** 一次性的輔助工具：把選到的分類填進下面兩個欄位後就復原，避免看起來像一個會被送出的欄位 */
function pickGroup(e: Event): void {
  const select = e.target as HTMLSelectElement
  const g = knownGroups.value.find((v) => v.n === select.value)
  select.value = ''
  if (!g) return
  form.n = g.n
  form.group = g.group
  form.groupEn = g.groupEn
}

const loading = ref(false)
const notFound = ref(false)
const loadError = ref('')

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    if (!store.loaded) store.setAll((await run(adminApi.listDownloads)).items)
    if (!isNew.value) {
      const item = store.items.find((d) => d.id === props.id)
      if (!item) {
        notFound.value = true
        return
      }
      Object.assign(form, { ...item, id: undefined })
    }
    snapshot.value = JSON.stringify(toInput())
    ready.value = true
  } catch (e) {
    loadError.value = messageOf(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

const ids = { n: 'dl-n', group: 'dl-group', name: 'dl-name', ext: 'dl-ext', href: 'dl-href' }

const { errors, validate, check } = useFormErrors({
  n: () =>
    isBlank(form.n)
      ? t('validation.required', { field: t('admin.downloads.fields.n') })
      : /^[0-9A-Za-z]{1,10}$/.test(form.n.trim())
        ? null
        : t('admin.downloads.fields.nError'),
  group: () =>
    isBlank(form.group)
      ? t('validation.required', { field: t('admin.downloads.fields.group') })
      : null,
  name: () =>
    isBlank(form.name)
      ? t('validation.required', { field: t('admin.downloads.fields.name') })
      : null,
  ext: () =>
    isBlank(form.ext) ? t('validation.required', { field: t('admin.downloads.fields.ext') }) : null,
  // 網址是必填：留空要說「請填寫網址」，不要丟格式錯誤讓人以為自己打錯了
  href: () =>
    isBlank(form.href)
      ? t('validation.required', { field: t('admin.downloads.fields.href') })
      : isHttpUrl(form.href)
        ? null
        : t('validation.url'),
})

const aria = (error: string, id: string) =>
  error ? { 'aria-invalid': 'true' as const, 'aria-describedby': `${id}-error` } : {}
const focusId = (key: keyof typeof ids): string => ids[key]

const saving = ref(false)
const saved = ref(false)
const formError = ref('')
const formEl = ref<HTMLFormElement | null>(null)

async function onSubmit(): Promise<void> {
  if (saving.value || !ready.value) return
  formError.value = ''
  if (!(await validate(formEl.value, focusId))) return
  saving.value = true
  const input = toInput()
  try {
    const { item } = isNew.value
      ? await run((token) => adminApi.createDownload(token, input))
      : await run((token) => adminApi.updateDownload(token, props.id!, input))
    store.upsert(item)
    clearSheetCache()
    saved.value = true
    setAdminFlash(isNew.value ? t('admin.downloads.created') : t('admin.downloads.updated'))
    await router.push({ name: 'adminDownloads' })
  } catch (e) {
    formError.value = messageOf(e)
  } finally {
    saving.value = false
  }
}

const leaveOpen = ref(false)
let resolveLeave: ((leave: boolean) => void) | null = null

function answerLeave(leave: boolean): void {
  leaveOpen.value = false
  resolveLeave?.(leave)
  resolveLeave = null
}

onBeforeRouteLeave(() => {
  if (saved.value || !dirty.value) return true
  resolveLeave?.(false)
  leaveOpen.value = true
  return new Promise<boolean>((resolve) => (resolveLeave = resolve))
})

useEventListener(window, 'beforeunload', (e: BeforeUnloadEvent) => {
  if (!dirty.value || saved.value) return
  e.preventDefault()
  e.returnValue = ''
})
</script>

<template lang="pug">
section.admin-edit
  RouterLink.text-link(:to="{ name: 'adminDownloads' }") {{ t('admin.downloads.back') }}
  h1.admin-edit__title {{ heading }}
    span.admin-edit__id(v-if="!isNew") ID {{ id }}

  p.form-alert(v-if="notFound" role="alert") {{ t('admin.downloads.notFound') }}
  p.form-alert(v-else-if="loadError" role="alert")
    | {{ loadError }}
    |
    button.text-link(type="button" @click="load") {{ t('common.retry') }}
  p.admin-edit__loading(v-else-if="loading" aria-busy="true") {{ t('common.loading') }}

  form.admin-edit__form(
    v-if="ready"
    ref="formEl"
    novalidate
    @submit.prevent="onSubmit"
  )
    p.form-alert(v-if="formError" role="alert") {{ formError }}
    p.admin-edit__hint {{ t('admin.downloads.formHint') }}

    FormField#dl-pick(v-if="isNew && knownGroups.length" :label="t('admin.downloads.fields.pick')")
      select#dl-pick.field__input(@change="pickGroup")
        option(value="") {{ t('admin.downloads.fields.pickPh') }}
        option(v-for="g in knownGroups" :key="g.n" :value="g.n") {{ g.n }}　{{ g.group }}

    .admin-edit__grid
      FormField(
        :id="ids.n"
        :label="t('admin.downloads.fields.n')"
        :error="errors.n"
        required
      )
        input.field__input(
          :id="ids.n"
          v-model="form.n"
          v-bind="aria(errors.n, ids.n)"
          type="text"
          maxlength="10"
          inputmode="numeric"
          :placeholder="t('admin.downloads.fields.nPh')"
          @blur="errors.n && check('n')"
        )
      FormField(
        :id="ids.group"
        :label="t('admin.downloads.fields.group')"
        :error="errors.group"
        required
      )
        input.field__input(
          :id="ids.group"
          v-model="form.group"
          v-bind="aria(errors.group, ids.group)"
          type="text"
          maxlength="100"
          @blur="errors.group && check('group')"
        )
      FormField#dl-group-en(:label="t('admin.downloads.fields.groupEn')")
        input#dl-group-en.field__input(
          v-model="form.groupEn"
          type="text"
          maxlength="200"
          lang="en"
        )
      FormField(
        :id="ids.ext"
        :label="t('admin.downloads.fields.ext')"
        :error="errors.ext"
        required
      )
        input.field__input(
          :id="ids.ext"
          v-model="form.ext"
          v-bind="aria(errors.ext, ids.ext)"
          type="text"
          maxlength="10"
          :placeholder="t('admin.downloads.fields.extPh')"
          @blur="errors.ext && check('ext')"
        )

    FormField(
      :id="ids.name"
      :label="t('admin.downloads.fields.name')"
      :error="errors.name"
      required
    )
      input.field__input(
        :id="ids.name"
        v-model="form.name"
        v-bind="aria(errors.name, ids.name)"
        type="text"
        maxlength="300"
        :placeholder="t('admin.downloads.fields.namePh')"
        @blur="errors.name && check('name')"
      )
    p.admin-edit__hint {{ t('admin.downloads.fields.nameHint') }}

    FormField#dl-name-en(:label="t('admin.downloads.fields.nameEn')")
      input#dl-name-en.field__input(
        v-model="form.nameEn"
        type="text"
        maxlength="500"
        lang="en"
      )

    FormField(
      :id="ids.href"
      :label="t('admin.downloads.fields.href')"
      :error="errors.href"
      required
    )
      input.field__input(
        :id="ids.href"
        v-model="form.href"
        v-bind="aria(errors.href, ids.href)"
        type="url"
        maxlength="1000"
        placeholder="https://"
        @blur="errors.href && check('href')"
      )
    p.admin-edit__hint {{ t('admin.downloads.fields.hrefHint') }}

    .admin-edit__visible
      label.checkbox
        input#dl-visible.checkbox__input(v-model="form.visible" type="checkbox")
        span.checkbox__box(aria-hidden="true")
        span.checkbox__text {{ t('admin.downloads.fields.visible') }}
      p.admin-edit__hint {{ t('admin.downloads.fields.visibleHint') }}

    .admin-edit__actions
      button.btn.btn--primary(type="submit" :disabled="saving")
        | {{ saving ? t('admin.news.saving') : t('admin.news.save') }}
      RouterLink.btn.btn--outline(:to="{ name: 'adminDownloads' }") {{ t('admin.cancel') }}

  ConfirmDialog(
    :open="leaveOpen"
    :title="t('admin.unsaved.title')"
    :confirm-text="t('admin.unsaved.leave')"
    :cancel-text="t('admin.unsaved.stay')"
    danger
    @confirm="answerLeave(true)"
    @cancel="answerLeave(false)"
  )
    p {{ t('admin.unsaved.body') }}
</template>

<style scoped lang="scss">
/* 編輯表單樣式（.admin-edit）在 src/styles/_admin.scss */
</style>
