<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeading from '@/components/common/PageHeading.vue'
import InfoPanel from '@/components/common/InfoPanel.vue'
import FormField from '@/components/common/FormField.vue'
import FileLink from '@/components/common/FileLink.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useFormErrors } from '@/composables/useFormErrors'
import { contactApi, fetchQuickFiles } from '@/api'
import type { ContactTopic } from '@/api/modules/contact'
import { isBlank, isEmail, isPhone } from '@/utils/validators'

const MESSAGE_MAX = 2000

type TextField = 'name' | 'organization' | 'phone' | 'email' | 'subject'

const { t, tm, rt, locale } = useI18n()
const route = useRoute()
const demo = contactApi.isDemoContact()

const { data: quickFiles } = useAsyncData(fetchQuickFiles, [])
const complaintForm = computed(() => quickFiles.value.find((f) => f.name.startsWith('TT-34-01')))

const initialTopic = (): ContactTopic | '' => {
  const q = route.query.topic
  return typeof q === 'string' && (contactApi.CONTACT_TOPICS as readonly string[]).includes(q)
    ? (q as ContactTopic)
    : ''
}

const emptyForm = () => ({
  topic: initialTopic(),
  name: '',
  organization: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
  privacy: false,
})
const form = reactive(emptyForm())
const honeypot = ref('')

const textFields: {
  key: TextField
  type: string
  autocomplete: string
  inputmode?: 'tel' | 'email'
  required: boolean
  wide?: boolean
}[] = [
  { key: 'name', type: 'text', autocomplete: 'name', required: true },
  { key: 'organization', type: 'text', autocomplete: 'organization', required: false },
  { key: 'phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel', required: false },
  { key: 'email', type: 'email', autocomplete: 'email', inputmode: 'email', required: true },
  { key: 'subject', type: 'text', autocomplete: 'off', required: true, wide: true },
]

const idOf = (key: string): string => `contact-${key}`
const label = (key: string): string => t(`contact.fields.${key}`)
const required = (v: string, key: string): string | null =>
  isBlank(v) ? t('validation.required', { field: label(key) }) : null

const { errors, count, check, validate, clear, aria } = useFormErrors({
  topic: () => (form.topic ? null : t('validation.topic')),
  name: () => required(form.name, 'name'),
  organization: () => null,
  phone: () => (isBlank(form.phone) || isPhone(form.phone) ? null : t('validation.phone')),
  email: () =>
    required(form.email, 'email') ?? (isEmail(form.email) ? null : t('validation.email')),
  subject: () => required(form.subject, 'subject'),
  message: () =>
    required(form.message, 'message') ??
    (form.message.length > MESSAGE_MAX
      ? t('validation.messageLength', { max: MESSAGE_MAX })
      : null),
  privacy: () => (form.privacy ? null : t('validation.privacy')),
})

const submitting = ref(false)
const submitted = ref(false)
const failed = ref(false)
const showSummary = ref(false)
const formEl = ref<HTMLFormElement | null>(null)

const notes = computed(() => (tm('contact.notes') as unknown as string[]).map((v) => rt(v)))

const recheck = (key: Parameters<typeof check>[0]): void => {
  if (errors[key]) check(key)
}

async function onSubmit(): Promise<void> {
  if (submitting.value) return
  failed.value = false
  const ok = await validate(formEl.value, idOf)
  showSummary.value = !ok
  if (!ok) return
  submitting.value = true
  try {
    await contactApi.sendContact(
      {
        topic: t(`contact.topics.${form.topic}`),
        name: form.name,
        organization: form.organization,
        phone: form.phone,
        email: form.email,
        subject: form.subject,
        message: form.message,
        privacy: form.privacy ? 'yes' : 'no',
        locale: locale.value,
      },
      honeypot.value,
    )
    submitted.value = true
  } catch {
    failed.value = true
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
  .page__inner.l-container
    PageHeading(
      :eyebrow="t('contact.eyebrow')"
      :title="t('contact.title')"
      :lead="t('contact.lead')"
    )

    .contact
      section.contact-form.contact-form--done(v-if="submitted" role="status")
        h2.contact-form__done-title {{ t('contact.successTitle') }}
        p {{ t('contact.success') }}
        button.btn.btn--outline(type="button" @click="reset") {{ t('contact.again') }}

      form.contact-form(
        v-else
        ref="formEl"
        :name="contactApi.CONTACT_FORM_NAME"
        novalidate
        @submit.prevent="onSubmit"
      )
        p.form-alert.form-alert--info(v-if="demo") {{ t('contact.demo') }}
        p.form-alert(v-if="failed" role="alert") {{ t('contact.failed') }}

        .contact-form__grid
          FormField.contact-form__wide(
            :id="idOf('topic')"
            :label="t('contact.topic')"
            :error="errors.topic"
            required
          )
            select.field__input.field__select(
              :id="idOf('topic')"
              v-model="form.topic"
              v-bind="aria('topic', idOf('topic'))"
              @change="recheck('topic')"
            )
              option(value="" disabled) {{ t('contact.topicPh') }}
              option(v-for="k in contactApi.CONTACT_TOPICS" :key="k" :value="k") {{ t(`contact.topics.${k}`) }}

          FormField(
            v-for="f in textFields"
            :id="idOf(f.key)"
            :key="f.key"
            :class="{ 'contact-form__wide': f.wide }"
            :label="label(f.key)"
            :error="errors[f.key]"
            :required="f.required"
          )
            input.field__input(
              :id="idOf(f.key)"
              v-model.trim="form[f.key]"
              v-bind="aria(f.key, idOf(f.key))"
              :type="f.type"
              :inputmode="f.inputmode"
              :autocomplete="f.autocomplete"
              :placeholder="t(`contact.fields.${f.key}Ph`)"
              @blur="recheck(f.key)"
            )

          FormField.contact-form__wide(
            :id="idOf('message')"
            :label="label('message')"
            :error="errors.message"
            required
          )
            textarea.field__input.field__textarea(
              :id="idOf('message')"
              v-model="form.message"
              v-bind="aria('message', idOf('message'))"
              rows="7"
              :placeholder="t('contact.fields.messagePh')"
              @blur="recheck('message')"
            )
          p.contact-form__count(
            :class="{ 'is-over': form.message.length > MESSAGE_MAX }"
            aria-live="polite"
          ) {{ t('contact.count', { count: form.message.length, max: MESSAGE_MAX }) }}

        //- 防機器人欄位：真人看不到也不會用鍵盤移到這裡
        .contact-form__hp(aria-hidden="true")
          label
            | Leave this field empty
            input(
              v-model="honeypot"
              :name="contactApi.CONTACT_HONEYPOT"
              tabindex="-1"
              autocomplete="off"
            )

        .contact-form__consent
          label.checkbox(:class="{ 'is-invalid': errors.privacy }")
            input.checkbox__input(
              :id="idOf('privacy')"
              v-model="form.privacy"
              v-bind="aria('privacy', idOf('privacy'))"
              type="checkbox"
              @change="recheck('privacy')"
            )
            span.checkbox__box(aria-hidden="true")
            span.checkbox__text
              | {{ t('contact.privacyBefore') }}
              RouterLink(:to="{ name: 'privacy' }" target="_blank") {{ t('contact.privacyDoc') }}
              | {{ t('contact.privacyAfter') }}
          p.field__error(v-if="errors.privacy" :id="`${idOf('privacy')}-error`") {{ errors.privacy }}

        p.form-alert(v-if="showSummary && count" role="alert") {{ t('validation.summary', { count }) }}
        button.contact-form__submit(type="submit" :disabled="submitting")
          | {{ submitting ? t('contact.submitting') : t('contact.submit') }}

      aside.contact__aside
        InfoPanel(:title="t('contact.notesTitle')" size="lg")
          ul.dot-list
            li(v-for="n in notes" :key="n") {{ n }}
        InfoPanel(:title="t('contact.complaintTitle')" tone="card")
          p {{ t('contact.complaintBody') }}
          FileLink(
            v-if="complaintForm"
            :name="complaintForm.name"
            :href="complaintForm.href"
            :ext="complaintForm.ext"
            variant="tile"
          )
        InfoPanel(:title="t('contact.mailTitle')" tone="card")
          address.contact__address.pre-line
            | {{ t('common.mailingBlock', { address: t('site.address'), company: t('site.company') }) }}
</template>

<style scoped lang="scss">
.contact {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  @include below(lg) {
    grid-template-columns: minmax(0, 1fr);
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__address {
    font-style: normal;
    font-size: 13px;
  }
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 32px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(sm) {
    padding: 24px 18px;
  }

  &__grid {
    @include auto-grid(240px, 18px);
  }

  &__wide {
    grid-column: 1 / -1;
  }

  &__count {
    grid-column: 1 / -1;
    margin: -10px 0 0;
    font-size: 12px;
    color: $c-muted;
    text-align: right;

    &.is-over {
      color: $c-danger;
      font-weight: 700;
    }
  }

  &__hp {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__consent {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &--done {
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
}

.field__select {
  appearance: none;
  padding-right: 42px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%2306717A' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
}

.field__textarea {
  min-height: 170px;
  resize: vertical;
  line-height: 1.8;
}
</style>
