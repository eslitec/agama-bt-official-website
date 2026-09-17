<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import MIcon from '@/components/common/MIcon.vue'
import FormField from '@/components/common/FormField.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { clearSheetCache } from '@/api/sheet'
import { useAdminNewsStore } from '@/stores/adminNews'
import { setAdminFlash, useAdminRequest } from '@/composables/useAdmin'
import { useFormErrors } from '@/composables/useFormErrors'
import {
  cleanNewsInput,
  emptyNewsInput,
  normalizeNewsDate,
  toDateInputValue,
} from '@/utils/admin-news'
import { isBlank, isHttpUrl } from '@/utils/validators'
import type { AdminNewsInput } from '@/types/models'

const props = defineProps<{
  /** 未提供時為新增 */
  id?: number
}>()

const { t } = useI18n()
const router = useRouter()
const store = useAdminNewsStore()
const { run, messageOf } = useAdminRequest()

const isNew = computed(() => props.id === undefined)
const heading = computed(() => (isNew.value ? t('admin.news.newTitle') : t('admin.news.editTitle')))

/* ───────── 表單狀態 ───────── */

const ready = ref(false)
let rowSeq = 0
interface AttRow {
  key: number
  label: string
  href: string
}
interface ImgRow {
  key: number
  url: string
}

const form = reactive({
  /** 原生 date 輸入框的值（YYYY-MM-DD） */
  date: '',
  no: '',
  src: '',
  srcEn: '',
  title: '',
  titleEn: '',
  atts: [] as AttRow[],
  imgs: [] as ImgRow[],
  visible: true,
})

function fill(input: AdminNewsInput): void {
  form.date = toDateInputValue(input.date)
  form.no = input.no
  form.src = input.src
  form.srcEn = input.srcEn
  form.title = input.title
  form.titleEn = input.titleEn
  form.atts = input.atts.map((a) => ({ key: ++rowSeq, label: a.label, href: a.href }))
  form.imgs = input.imgs.map((url) => ({ key: ++rowSeq, url }))
  form.visible = input.visible
}

const toInput = (): AdminNewsInput =>
  cleanNewsInput({
    date: form.date,
    no: form.no,
    src: form.src,
    srcEn: form.srcEn,
    title: form.title,
    titleEn: form.titleEn,
    atts: form.atts.map(({ label, href }) => ({ label, href })),
    imgs: form.imgs.map((r) => r.url),
    visible: form.visible,
  })

const snapshot = ref('')
const takeSnapshot = (): void => {
  snapshot.value = JSON.stringify(toInput())
}
const dirty = computed(() => ready.value && JSON.stringify(toInput()) !== snapshot.value)

const addAtt = (): void => {
  form.atts.push({ key: ++rowSeq, label: '', href: '' })
}
const addImg = (): void => {
  form.imgs.push({ key: ++rowSeq, url: '' })
}

/* ───────── 載入 ───────── */

const loading = ref(false)
const notFound = ref(false)
const loadError = ref('')

async function load(): Promise<void> {
  if (isNew.value) {
    fill(emptyNewsInput())
    takeSnapshot()
    ready.value = true
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    if (!store.loaded) store.setAll((await run(adminApi.listNews)).items)
    const item = store.items.find((n) => n.id === props.id)
    if (!item) {
      notFound.value = true
      return
    }
    fill(item)
    takeSnapshot()
    ready.value = true
  } catch (e) {
    loadError.value = messageOf(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* ───────── 驗證 ───────── */

const ids = { date: 'news-date', title: 'news-title' }
const attId = (i: number, part: 'label' | 'href'): string => `news-att-${i}-${part}`
const imgId = (i: number): string => `news-img-${i}`

const attErrors = computed(() =>
  form.atts.map((a, i) => {
    const blank = isBlank(a.label) && isBlank(a.href)
    return {
      label:
        !blank && isBlank(a.label)
          ? t('validation.required', { field: t('admin.news.fields.attLabel', { n: i + 1 }) })
          : '',
      href: !blank && !isHttpUrl(a.href) ? t('validation.url') : '',
    }
  }),
)
const imgErrors = computed(() =>
  form.imgs.map((r) => (!isBlank(r.url) && !isHttpUrl(r.url) ? t('validation.url') : '')),
)
/** 附件、圖片的錯誤只在按下儲存後（或修正時）顯示 */
const showRowErrors = ref(false)

const { errors, validate, check } = useFormErrors({
  date: () =>
    isBlank(form.date)
      ? t('validation.required', { field: t('admin.news.fields.date') })
      : normalizeNewsDate(form.date)
        ? null
        : t('validation.date'),
  title: () =>
    isBlank(form.title) ? t('validation.required', { field: t('admin.news.fields.title') }) : null,
  atts: () => attErrors.value.flatMap((e) => [e.label, e.href]).find(Boolean) ?? null,
  imgs: () => imgErrors.value.find(Boolean) ?? null,
})

const aria = (error: string, id: string) =>
  error ? { 'aria-invalid': 'true' as const, 'aria-describedby': `${id}-error` } : {}

function focusId(key: 'date' | 'title' | 'atts' | 'imgs'): string {
  if (key === 'atts') {
    const i = attErrors.value.findIndex((e) => e.label || e.href)
    return attId(i, attErrors.value[i]?.label ? 'label' : 'href')
  }
  if (key === 'imgs') return imgId(imgErrors.value.findIndex(Boolean))
  return ids[key]
}

/* ───────── 儲存 ───────── */

const saving = ref(false)
const saved = ref(false)
const formError = ref('')
const formEl = ref<HTMLFormElement | null>(null)

async function onSubmit(): Promise<void> {
  if (saving.value || !ready.value) return
  formError.value = ''
  showRowErrors.value = true
  if (!(await validate(formEl.value, focusId))) return
  saving.value = true
  const input = toInput()
  try {
    const { item } = isNew.value
      ? await run((token) => adminApi.createNews(token, input))
      : await run((token) => adminApi.updateNews(token, props.id!, input))
    store.upsert(item)
    clearSheetCache()
    saved.value = true
    setAdminFlash(isNew.value ? t('admin.news.created') : t('admin.news.updated'))
    await router.push({ name: 'adminNews' })
  } catch (e) {
    formError.value = messageOf(e)
  } finally {
    saving.value = false
  }
}

/* ───────── 未儲存提醒 ───────── */

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
section.news-edit
  RouterLink.text-link(:to="{ name: 'adminNews' }") {{ t('admin.news.back') }}
  h1.news-edit__title {{ heading }}
    span.news-edit__id(v-if="!isNew") ID {{ id }}

  p.form-alert(v-if="notFound" role="alert") {{ t('admin.news.notFound') }}
  p.form-alert(v-else-if="loadError" role="alert")
    | {{ loadError }}
    |
    button.text-link(type="button" @click="load") {{ t('common.retry') }}
  p.news-edit__loading(v-else-if="loading" aria-busy="true") {{ t('common.loading') }}

  form.news-edit__form(
    v-if="ready"
    ref="formEl"
    novalidate
    @submit.prevent="onSubmit"
  )
    p.form-alert(v-if="formError" role="alert") {{ formError }}

    .news-edit__grid
      FormField(
        :id="ids.date"
        :label="t('admin.news.fields.date')"
        :error="errors.date"
        required
      )
        input.field__input(
          :id="ids.date"
          v-model="form.date"
          v-bind="aria(errors.date, ids.date)"
          type="date"
          @change="errors.date && check('date')"
        )
      FormField#news-no(:label="t('admin.news.fields.no')")
        input#news-no.field__input(
          v-model="form.no"
          type="text"
          maxlength="30"
          :placeholder="t('admin.news.fields.noPh')"
        )
      FormField#news-src(:label="t('admin.news.fields.src')")
        input#news-src.field__input(
          v-model="form.src"
          type="text"
          maxlength="100"
          :placeholder="t('admin.news.fields.srcPh')"
        )
      FormField#news-src-en(:label="t('admin.news.fields.srcEn')")
        input#news-src-en.field__input(
          v-model="form.srcEn"
          type="text"
          maxlength="200"
          lang="en"
          :placeholder="t('admin.news.fields.srcEnPh')"
        )

    FormField(
      :id="ids.title"
      :label="t('admin.news.fields.title')"
      :error="errors.title"
      required
    )
      input.field__input(
        :id="ids.title"
        v-model="form.title"
        v-bind="aria(errors.title, ids.title)"
        type="text"
        maxlength="300"
        :placeholder="t('admin.news.fields.titlePh')"
        @blur="errors.title && check('title')"
      )
    FormField#news-title-en(:label="t('admin.news.fields.titleEn')")
      input#news-title-en.field__input(
        v-model="form.titleEn"
        type="text"
        maxlength="500"
        lang="en"
        :placeholder="t('admin.news.fields.titleEnPh')"
      )

    fieldset.news-edit__group
      legend.news-edit__legend {{ t('admin.news.fields.atts') }}
      p.news-edit__hint {{ t('admin.news.fields.attsHint') }}
      .news-edit__row(v-for="(a, i) in form.atts" :key="a.key" data-row="att")
        FormField(
          :id="attId(i, 'label')"
          :label="t('admin.news.fields.attLabel', { n: i + 1 })"
          :error="showRowErrors ? attErrors[i]?.label : ''"
        )
          input.field__input(
            :id="attId(i, 'label')"
            v-model="a.label"
            v-bind="aria(showRowErrors ? (attErrors[i]?.label ?? '') : '', attId(i, 'label'))"
            type="text"
            maxlength="100"
            :placeholder="t('admin.news.fields.attLabelPh')"
          )
        FormField(
          :id="attId(i, 'href')"
          :label="t('admin.news.fields.attHref', { n: i + 1 })"
          :error="showRowErrors ? attErrors[i]?.href : ''"
        )
          input.field__input(
            :id="attId(i, 'href')"
            v-model="a.href"
            v-bind="aria(showRowErrors ? (attErrors[i]?.href ?? '') : '', attId(i, 'href'))"
            type="url"
            inputmode="url"
            maxlength="1000"
            spellcheck="false"
            :placeholder="t('admin.news.fields.attHrefPh')"
          )
        button.btn.btn--danger.btn--sm.news-edit__remove(
          type="button"
          :aria-label="t('admin.news.fields.removeAtt', { n: i + 1 })"
          @click="form.atts.splice(i, 1)"
        )
          MIcon(name="delete" :size="16")
          | {{ t('admin.news.fields.remove') }}
      button.btn.btn--outline.btn--sm.news-edit__add(type="button" @click="addAtt")
        MIcon(name="add" :size="16")
        | {{ t('admin.news.fields.addAtt') }}

    fieldset.news-edit__group
      legend.news-edit__legend {{ t('admin.news.fields.imgs') }}
      p.news-edit__hint {{ t('admin.news.fields.imgsHint') }}
      .news-edit__row.news-edit__row--single(
        v-for="(r, i) in form.imgs"
        :key="r.key"
        data-row="img"
      )
        FormField(
          :id="imgId(i)"
          :label="t('admin.news.fields.img', { n: i + 1 })"
          :error="showRowErrors ? imgErrors[i] : ''"
        )
          input.field__input(
            :id="imgId(i)"
            v-model="r.url"
            v-bind="aria(showRowErrors ? (imgErrors[i] ?? '') : '', imgId(i))"
            type="url"
            inputmode="url"
            maxlength="1000"
            spellcheck="false"
            placeholder="https://"
          )
        button.btn.btn--danger.btn--sm.news-edit__remove(
          type="button"
          :aria-label="t('admin.news.fields.removeImg', { n: i + 1 })"
          @click="form.imgs.splice(i, 1)"
        )
          MIcon(name="delete" :size="16")
          | {{ t('admin.news.fields.remove') }}
      button.btn.btn--outline.btn--sm.news-edit__add(type="button" @click="addImg")
        MIcon(name="add" :size="16")
        | {{ t('admin.news.fields.addImg') }}

    .news-edit__visible
      label.checkbox
        input#news-visible.checkbox__input(v-model="form.visible" type="checkbox")
        span.checkbox__box(aria-hidden="true")
        span.checkbox__text {{ t('admin.news.fields.visible') }}
      p.news-edit__hint {{ t('admin.news.fields.visibleHint') }}

    p.form-alert.form-alert--info {{ t('admin.publishNote') }}
    .news-edit__actions
      button.btn.btn--primary(type="submit" :disabled="saving")
        | {{ saving ? t('admin.news.saving') : t('admin.news.save') }}
      RouterLink.btn.btn--outline(:to="{ name: 'adminNews' }") {{ t('admin.cancel') }}

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
.news-edit {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;

  > * {
    max-width: 100%;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(24px, 4.5vw, 30px);
    font-weight: 900;
    color: $c-ink;
  }

  &__id {
    margin-left: 12px;
    font-family: $f-display;
    font-size: 14px;
    font-weight: 700;
    color: $c-muted;
  }

  &__loading {
    font-size: 14px;
    color: $c-muted;
  }

  &__form {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 32px;
    border: 1px solid $c-line;
    background: $c-white;

    @include below(sm) {
      padding: 22px 16px;
    }
  }

  &__grid {
    @include auto-grid(240px, 22px);
  }

  &__group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    margin: 0;
    padding: 18px;
    border: 1px solid $c-line;
  }

  &__legend {
    padding: 0 6px;
    font-size: 14px;
    font-weight: 700;
    color: $c-ink;
  }

  &__hint {
    font-size: 13px;
    line-height: 1.7;
    color: $c-muted;
  }

  &__row {
    align-self: stretch;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
    align-items: start;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed $c-line;

    &--single {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    @include below(md) {
      grid-template-columns: minmax(0, 1fr);

      &--single {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  }

  &__remove {
    // 與輸入框對齊（欄位標籤高度）
    margin-top: 26px;

    @include below(md) {
      margin-top: 0;
      justify-self: end;
    }
  }

  &__visible {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .btn {
      min-width: 120px;
    }
  }
}
</style>
