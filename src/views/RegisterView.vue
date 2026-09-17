<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InfoPanel from '@/components/common/InfoPanel.vue'
import FormField from '@/components/common/FormField.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useFormErrors } from '@/composables/useFormErrors'
import { useLocalized } from '@/composables/useLocalized'
import { memberApi } from '@/api'
import { ApiError } from '@/api/http'
import type { RegisterPayload } from '@/types/models'
import { externalUrls } from '@/utils/media'
import {
  isBlank,
  isEmail,
  isNationalId,
  isPhone,
  isStrongPassword,
  isTaxId,
} from '@/utils/validators'

type TextField = 'operatorName' | 'taxId' | 'owner' | 'contact' | 'phone' | 'email' | 'address'

const { t, tm, rt } = useI18n()
const { pick, langOf } = useLocalized()
// 類別選項：英文介面顯示英文名稱，送出的值一律是中文
const { data: categories } = useAsyncData(memberApi.fetchRegisterCategories, [])
const demo = memberApi.isDemoMember()

const emptyForm = (): RegisterPayload & { privacy: boolean } => ({
  operatorName: '',
  taxId: '',
  owner: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  categories: [],
  password: '',
  passwordConfirm: '',
  agree: false,
  privacy: false,
})
const form = reactive(emptyForm())

const basicFields: {
  key: TextField
  type: string
  autocomplete: string
  inputmode?: 'tel' | 'email'
  wide?: boolean
}[] = [
  { key: 'operatorName', type: 'text', autocomplete: 'organization' },
  { key: 'taxId', type: 'text', autocomplete: 'off' },
  { key: 'owner', type: 'text', autocomplete: 'name' },
  { key: 'contact', type: 'text', autocomplete: 'name' },
  { key: 'phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel' },
  { key: 'email', type: 'email', autocomplete: 'email', inputmode: 'email' },
  { key: 'address', type: 'text', autocomplete: 'street-address', wide: true },
]

const idOf = (key: string): string =>
  ({ categories: 'reg-cat-0', agree: 'reg-agree', privacy: 'reg-privacy' })[key] ?? `reg-${key}`

const label = (key: string): string => t(`register.fields.${key}`)
const required = (v: string, key: string): string | null =>
  isBlank(v) ? t('validation.required', { field: label(key) }) : null

const { errors, count, check, validate, clear, aria } = useFormErrors({
  operatorName: () => required(form.operatorName, 'operatorName'),
  taxId: () =>
    required(form.taxId, 'taxId') ??
    (isTaxId(form.taxId) || isNationalId(form.taxId) ? null : t('validation.taxId')),
  owner: () => required(form.owner, 'owner'),
  contact: () => required(form.contact, 'contact'),
  phone: () =>
    required(form.phone, 'phone') ?? (isPhone(form.phone) ? null : t('validation.phone')),
  email: () =>
    required(form.email, 'email') ?? (isEmail(form.email) ? null : t('validation.email')),
  address: () => required(form.address, 'address'),
  categories: () => (form.categories.length ? null : t('validation.categories')),
  password: () =>
    required(form.password, 'password') ??
    (isStrongPassword(form.password) ? null : t('validation.password')),
  passwordConfirm: () =>
    required(form.passwordConfirm, 'passwordConfirm') ??
    (form.passwordConfirm === form.password ? null : t('validation.passwordConfirm')),
  agree: () => (form.agree ? null : t('validation.agree')),
  privacy: () => (form.privacy ? null : t('validation.privacy')),
})

const showPw = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const showSummary = ref(false)
const formError = ref<'' | 'unavailable' | 'failed'>('')
const formEl = ref<HTMLFormElement | null>(null)

const list = (key: string): string[] => (tm(key) as unknown as string[]).map((v) => rt(v))

const toggleCategory = (c: string): void => {
  const i = form.categories.indexOf(c)
  if (i >= 0) form.categories.splice(i, 1)
  else form.categories.push(c)
  if (errors.categories) check('categories')
}

const recheck = (key: Parameters<typeof check>[0]): void => {
  if (errors[key]) check(key)
}

async function onSubmit(): Promise<void> {
  if (submitting.value) return
  formError.value = ''
  const ok = await validate(formEl.value, idOf)
  showSummary.value = !ok
  if (!ok) return
  submitting.value = true
  try {
    const { privacy: _privacy, ...payload } = form
    void _privacy
    await memberApi.register({ ...payload, categories: [...form.categories] })
    submitted.value = true
  } catch (e) {
    formError.value =
      e instanceof ApiError && e.code === 'MEMBER_UNAVAILABLE' ? 'unavailable' : 'failed'
  } finally {
    submitting.value = false
  }
}

function reset(): void {
  Object.assign(form, emptyForm())
  clear()
  submitted.value = false
  showSummary.value = false
}
</script>

<template lang="pug">
.page.l-section(style="--page-gap: 26px")
  .page__inner.l-container.register
    header.register__head
      span.register__eyebrow {{ t('register.eyebrow') }}
      h1.register__title {{ t('register.title') }}
      p.register__lead
        | {{ t('register.leadBefore') }}
        RouterLink.register__login(:to="{ name: 'login' }") {{ t('register.leadLogin') }}
        | {{ t('register.leadAfter') }}

    .register__layout
      section.reg-form.reg-form__done(v-if="submitted" role="status")
        h2.reg-form__done-title {{ t('register.successTitle') }}
        p {{ t('register.success') }}
        button.btn.btn--outline(type="button" @click="reset") {{ t('register.again') }}

      form.reg-form(
        v-else
        ref="formEl"
        novalidate
        @submit.prevent="onSubmit"
      )
        p.form-alert.form-alert--info(v-if="demo") {{ t('register.demo') }}
        p.form-alert(v-if="formError === 'unavailable'" role="alert")
          | {{ t('register.unavailable') }}
          RouterLink(:to="{ name: 'download' }") {{ t('register.unavailableLink') }}
        p.form-alert(v-else-if="formError === 'failed'" role="alert") {{ t('login.failed') }}

        fieldset.reg-form__section
          legend.reg-form__legend
            span.reg-form__num 01
            span.reg-form__legend-text {{ t('register.sectionBasic') }}
          .reg-form__grid
            FormField(
              v-for="f in basicFields"
              :id="idOf(f.key)"
              :key="f.key"
              :class="{ 'reg-form__wide': f.wide }"
              :label="label(f.key)"
              :error="errors[f.key]"
              required
            )
              input.field__input(
                :id="idOf(f.key)"
                v-model.trim="form[f.key]"
                v-bind="aria(f.key, idOf(f.key))"
                :type="f.type"
                :inputmode="f.inputmode"
                :autocomplete="f.autocomplete"
                :placeholder="t(`register.fields.${f.key}Ph`)"
                @blur="recheck(f.key)"
              )

        fieldset.reg-form__section(
          :aria-describedby="errors.categories ? 'reg-cat-error' : undefined"
        )
          legend.reg-form__legend
            span.reg-form__num 02
            span.reg-form__legend-text {{ t('register.sectionCategory') }}
            span.reg-form__count(aria-live="polite") {{ t('register.selected', { count: form.categories.length }) }}
          .reg-form__chips
            button.chip(
              v-for="(c, i) in categories"
              :id="`reg-cat-${i}`"
              :key="c.value"
              type="button"
              :class="{ 'is-on': form.categories.includes(c.value) }"
              :aria-pressed="form.categories.includes(c.value)"
              :lang="langOf(c.labelEn)"
              @click="toggleCategory(c.value)"
            ) {{ pick(c.value, c.labelEn) }}
          p#reg-cat-error.reg-form__group-error(v-if="errors.categories") {{ errors.categories }}

        fieldset.reg-form__section
          legend.reg-form__legend
            span.reg-form__num 03
            span.reg-form__legend-text {{ t('register.sectionPassword') }}
          .reg-form__grid
            FormField(
              :id="idOf('password')"
              :label="label('password')"
              :error="errors.password"
              required
            )
              input.field__input(
                :id="idOf('password')"
                v-model="form.password"
                v-bind="aria('password', idOf('password'))"
                :type="showPw ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="t('register.fields.passwordPh')"
                @blur="recheck('password')"
              )
              button.field__addon(
                type="button"
                aria-controls="reg-password reg-passwordConfirm"
                :aria-pressed="showPw"
                @click="showPw = !showPw"
              ) {{ showPw ? t('login.hidePassword') : t('login.showPassword') }}
            FormField(
              :id="idOf('passwordConfirm')"
              :label="label('passwordConfirm')"
              :error="errors.passwordConfirm"
              required
            )
              input.field__input(
                :id="idOf('passwordConfirm')"
                v-model="form.passwordConfirm"
                v-bind="aria('passwordConfirm', idOf('passwordConfirm'))"
                :type="showPw ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="t('register.fields.passwordConfirmPh')"
                @blur="recheck('passwordConfirm')"
              )

        .reg-form__consents
          label.checkbox(:class="{ 'is-invalid': errors.agree }")
            input#reg-agree.checkbox__input(
              v-model="form.agree"
              v-bind="aria('agree', 'reg-agree')"
              type="checkbox"
              @change="recheck('agree')"
            )
            span.checkbox__box(aria-hidden="true")
            span.checkbox__text
              | {{ t('register.agreeBefore') }}
              a(:href="externalUrls.agreement" target="_blank" rel="noopener") {{ t('register.agreeDoc') }}
              | {{ t('register.agreeAfter') }}
          p#reg-agree-error.field__error(v-if="errors.agree") {{ errors.agree }}
          label.checkbox(:class="{ 'is-invalid': errors.privacy }")
            input#reg-privacy.checkbox__input(
              v-model="form.privacy"
              v-bind="aria('privacy', 'reg-privacy')"
              type="checkbox"
              @change="recheck('privacy')"
            )
            span.checkbox__box(aria-hidden="true")
            span.checkbox__text
              | {{ t('register.privacyBefore') }}
              RouterLink(:to="{ name: 'privacy' }" target="_blank") {{ t('register.privacyDoc') }}
              | {{ t('register.privacyAfter') }}
          p#reg-privacy-error.field__error(v-if="errors.privacy") {{ errors.privacy }}

        p.form-alert(v-if="showSummary && count" role="alert") {{ t('validation.summary', { count }) }}
        button.reg-form__submit(type="submit" :disabled="submitting")
          | {{ submitting ? t('register.submitting') : t('register.submit') }}
        p.reg-form__note {{ t('register.noteReady') }}

      aside.register__aside
        InfoPanel(:title="t('register.prepareTitle')" size="lg")
          ul.dot-list
            li(v-for="p in list('register.prepare')" :key="p") {{ p }}
          RouterLink.text-link(:to="{ name: 'download' }") {{ t('register.prepareLink') }}
        InfoPanel(:title="t('register.nextTitle')" tone="card" size="lg")
          ol.register__steps
            li(v-for="n in list('register.next')" :key="n") {{ n }}
          RouterLink.text-link(:to="{ name: 'how' }") {{ t('register.nextLink') }}
        InfoPanel(:title="t('register.mailTitle')" tone="card")
          address.register__address.pre-line
            | {{ t('common.mailingBlock', { address: t('site.address'), company: t('site.company') }) }}
</template>

<style scoped lang="scss">
.register {
  padding-top: 48px;

  &__head {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(28px, 5vw, 32px);
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    font-size: 14px;
    line-height: 1.85;
    color: $c-muted;
  }

  &__login {
    color: $c-primary;
    font-weight: 700;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;

    @include below(lg) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__steps {
    margin: 0;
    padding-left: 1.3em;
    line-height: 2;
  }

  &__address {
    font-style: normal;
    font-size: 13px;
  }
}

.reg-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 32px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(sm) {
    padding: 24px 18px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  &__legend {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 0;
    float: left; // 讓 legend 參與 flex 排版

    &::after {
      content: '';
      order: 2;
      height: 1px;
      flex: 1;
      background: $c-line-soft-2;
    }

    + * {
      clear: both;
    }
  }

  &__num {
    font-family: $f-mono;
    font-size: 12px;
    color: $c-primary;
  }

  &__legend-text {
    font-size: 18px;
    font-weight: 900;
    color: $c-ink;
  }

  &__count {
    order: 3;
    font-size: 12px;
    color: $c-muted;
  }

  &__grid {
    @include auto-grid(240px, 18px);
  }

  &__wide {
    grid-column: 1 / -1;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__group-error {
    margin: -10px 0 0;
    font-size: 13px;
    color: $c-danger;
  }

  &__consents {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
  }

  &__done {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  &__done-title {
    font-size: 20px;
    font-weight: 900;
    color: $c-primary-dark;
  }

  &__submit {
    @include button-reset;
    padding: 16px;
    background: $c-primary;
    color: $c-paper;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
    transition:
      filter 0.2s,
      transform 0.2s;
    @include focus-ring;
    @include hover {
      filter: brightness(0.92);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: progress;
    }
  }

  &__note {
    font-size: 13px;
    line-height: 1.8;
    color: $c-muted;

    &.is-error {
      color: $c-danger;
    }

    &.is-success {
      color: $c-primary;
      font-weight: 700;
    }
  }
}

.chip {
  @include button-reset;
  padding: 11px 18px;
  border: 1px solid $c-line-2;
  background: $c-white;
  color: $c-text;
  font-size: 14px;
  transition:
    border-color 0.2s,
    transform 0.2s,
    background 0.2s;
  @include focus-ring;
  @include hover {
    border-color: $c-primary;
    transform: translateY(-2px);
  }

  &.is-on {
    background: $c-primary;
    border-color: $c-primary;
    color: $c-paper;
  }
}
</style>
