<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import FormField from '@/components/common/FormField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminCareersStore } from '@/stores/adminCareers'
import { setAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { useFormErrors } from '@/composables/useFormErrors'
import { isBlank } from '@/utils/validators'
import type { AdminCareerInput, CareerKind } from '@/types/models'

const KINDS: CareerKind[] = ['job', 'training']

const props = defineProps<{
  /** 未提供時為新增 */
  id?: number
}>()

const { t } = useI18n()
const router = useRouter()
const store = useAdminCareersStore()
const { run, messageOf } = useAdminRequest()

const isNew = computed(() => props.id === undefined)
const heading = computed(() =>
  isNew.value ? t('admin.careers.newTitle') : t('admin.careers.editTitle'),
)

const ready = ref(false)
const form = reactive<AdminCareerInput>({
  kind: 'job',
  title: '',
  titleEn: '',
  place: '',
  nature: '',
  period: '',
  body: '',
  bodyEn: '',
  href: '',
  visible: true,
})

const toInput = (): AdminCareerInput => ({
  kind: form.kind,
  title: form.title.trim(),
  titleEn: form.titleEn.trim(),
  place: form.place.trim(),
  nature: form.nature.trim(),
  period: form.period.trim(),
  body: form.body.trim(),
  bodyEn: form.bodyEn.trim(),
  href: form.href.trim(),
  visible: form.visible,
})

const snapshot = ref('')
const dirty = computed(() => ready.value && JSON.stringify(toInput()) !== snapshot.value)

const loading = ref(false)
const notFound = ref(false)
const loadError = ref('')

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    if (!isNew.value) {
      if (!store.loaded) store.setAll((await run(adminApi.listCareers)).items)
      const item = store.items.find((c) => c.id === props.id)
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

const ids = { title: 'career-title', body: 'career-body', href: 'career-href' }

/** 連結可留空；有填時只接受 http(s) 或 mailto */
const isLink = (v: string): boolean => /^(https?:\/\/|mailto:)\S+$/.test(v.trim())

const { errors, validate, check } = useFormErrors({
  title: () =>
    isBlank(form.title)
      ? t('validation.required', { field: t('admin.careers.fields.title') })
      : null,
  body: () =>
    isBlank(form.body) ? t('validation.required', { field: t('admin.careers.fields.body') }) : null,
  href: () =>
    isBlank(form.href) || isLink(form.href) ? null : t('admin.careers.fields.hrefError'),
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
      ? await run((token) => adminApi.createCareer(token, input))
      : await run((token) => adminApi.updateCareer(token, props.id!, input))
    store.upsert(item)
    clearSheetCache()
    saved.value = true
    setAdminFlash(isNew.value ? t('admin.careers.created') : t('admin.careers.updated'))
    await router.push({ name: 'adminCareers' })
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
  RouterLink.text-link(:to="{ name: 'adminCareers' }") {{ t('admin.careers.back') }}
  h1.admin-edit__title {{ heading }}
    span.admin-edit__id(v-if="!isNew") ID {{ id }}

  p.form-alert(v-if="notFound" role="alert") {{ t('admin.careers.notFound') }}
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

    fieldset.admin-edit__group
      legend.admin-edit__legend {{ t('admin.careers.fields.kind') }}
      .segmented(role="radiogroup" :aria-label="t('admin.careers.fields.kind')")
        label.segmented__item(v-for="k in KINDS" :key="k")
          input.segmented__input(
            v-model="form.kind"
            type="radio"
            name="career-kind"
            :value="k"
          )
          span.segmented__text {{ t(`careers.kinds.${k}`) }}

    FormField(
      :id="ids.title"
      :label="t('admin.careers.fields.title')"
      :error="errors.title"
      required
    )
      input.field__input(
        :id="ids.title"
        v-model="form.title"
        v-bind="aria(errors.title, ids.title)"
        type="text"
        maxlength="200"
        @blur="errors.title && check('title')"
      )
    FormField#career-title-en(:label="t('admin.careers.fields.titleEn')")
      input#career-title-en.field__input(
        v-model="form.titleEn"
        type="text"
        maxlength="300"
        lang="en"
      )

    .admin-edit__grid
      FormField#career-place(:label="t('admin.careers.fields.place')")
        input#career-place.field__input(
          v-model="form.place"
          type="text"
          maxlength="100"
          :placeholder="t('admin.careers.fields.placePh')"
        )
      FormField#career-nature(:label="t('admin.careers.fields.nature')")
        input#career-nature.field__input(
          v-model="form.nature"
          type="text"
          maxlength="100"
          :placeholder="t('admin.careers.fields.naturePh')"
        )
      FormField#career-period(:label="t('admin.careers.fields.period')")
        input#career-period.field__input(
          v-model="form.period"
          type="text"
          maxlength="100"
          :placeholder="t('admin.careers.fields.periodPh')"
        )

    FormField(
      :id="ids.body"
      :label="t('admin.careers.fields.body')"
      :error="errors.body"
      required
    )
      textarea.field__input.field__textarea(
        :id="ids.body"
        v-model="form.body"
        v-bind="aria(errors.body, ids.body)"
        rows="8"
        maxlength="4000"
        :placeholder="t('admin.careers.fields.bodyPh')"
        @blur="errors.body && check('body')"
      )
    p.admin-edit__hint {{ t('admin.careers.fields.bodyHint') }}

    FormField#career-body-en(:label="t('admin.careers.fields.bodyEn')")
      textarea#career-body-en.field__input.field__textarea(
        v-model="form.bodyEn"
        rows="6"
        maxlength="6000"
        lang="en"
      )

    FormField(:id="ids.href" :label="t('admin.careers.fields.href')" :error="errors.href")
      input.field__input(
        :id="ids.href"
        v-model="form.href"
        v-bind="aria(errors.href, ids.href)"
        type="text"
        maxlength="1000"
        :placeholder="t('admin.careers.fields.hrefPh')"
        @blur="errors.href && check('href')"
      )
    p.admin-edit__hint {{ t('admin.careers.fields.hrefHint') }}

    .admin-edit__visible
      label.checkbox
        input#career-visible.checkbox__input(v-model="form.visible" type="checkbox")
        span.checkbox__box(aria-hidden="true")
        span.checkbox__text {{ t('admin.careers.fields.visible') }}
      p.admin-edit__hint {{ t('admin.careers.fields.visibleHint') }}

    .admin-edit__actions
      button.btn.btn--primary(type="submit" :disabled="saving")
        | {{ saving ? t('admin.news.saving') : t('admin.news.save') }}
      RouterLink.btn.btn--outline(:to="{ name: 'adminCareers' }") {{ t('admin.cancel') }}

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
