<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InfoPanel from '@/components/common/InfoPanel.vue'
import FormField from '@/components/common/FormField.vue'
import { useAuthStore } from '@/stores/auth'
import { useFormErrors } from '@/composables/useFormErrors'
import { memberApi } from '@/api'
import { ApiError } from '@/api/http'
import { isBlank, isMemberAccount } from '@/utils/validators'
import { media } from '@/utils/media'

const { t, tm, rt } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ account: '', password: '', remember: false })
const showPw = ref(false)
const submitting = ref(false)
const formError = ref('')
const formEl = ref<HTMLFormElement | null>(null)
/** 忘記密碼、登入問題 → 意見反應表單並預選「會員與帳號」 */
const memberHelp = { name: 'contact', query: { topic: 'member' } }
const demo = memberApi.isDemoMember()
const features = (): string[] => (tm('login.features') as unknown as string[]).map((v) => rt(v))

const ids = { account: 'login-account', password: 'login-password' } as const
const { errors, check, validate, aria } = useFormErrors({
  account: () =>
    isBlank(form.account)
      ? t('validation.required', { field: t('login.account') })
      : isMemberAccount(form.account)
        ? null
        : t('validation.account'),
  password: () =>
    isBlank(form.password) ? t('validation.required', { field: t('login.password') }) : null,
})

async function onSubmit(): Promise<void> {
  if (submitting.value) return
  formError.value = ''
  if (!(await validate(formEl.value, (k) => ids[k]))) return
  submitting.value = true
  try {
    await auth.login({ ...form })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.push(
      redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : { name: 'home' },
    )
  } catch (e) {
    formError.value =
      e instanceof ApiError && e.code === 'MEMBER_UNAVAILABLE'
        ? t('login.unavailable')
        : t('login.failed')
  } finally {
    submitting.value = false
  }
}
</script>

<template lang="pug">
.page.l-section
  .login.l-container
    form.login-card(ref="formEl" novalidate @submit.prevent="onSubmit")
      header.login-card__head
        span.login-card__eyebrow {{ t('login.eyebrow') }}
        h1.login-card__title {{ t('login.title') }}
        p.login-card__lead {{ t('login.lead') }}

      p.form-alert.form-alert--info(v-if="demo") {{ t('login.demo') }}
      p.form-alert(v-if="formError" role="alert") {{ formError }}

      FormField(
        :id="ids.account"
        :label="t('login.account')"
        :error="errors.account"
        required
      )
        input.field__input(
          :id="ids.account"
          v-model.trim="form.account"
          v-bind="aria('account', ids.account)"
          type="text"
          inputmode="email"
          autocomplete="username"
          :placeholder="t('login.accountPlaceholder')"
          @blur="errors.account && check('account')"
        )
      FormField(
        :id="ids.password"
        :label="t('login.password')"
        :error="errors.password"
        required
      )
        input.field__input(
          :id="ids.password"
          v-model="form.password"
          v-bind="aria('password', ids.password)"
          :type="showPw ? 'text' : 'password'"
          autocomplete="current-password"
          :placeholder="t('login.passwordPlaceholder')"
          @blur="errors.password && check('password')"
        )
        button.field__addon(
          type="button"
          :aria-controls="ids.password"
          :aria-pressed="showPw"
          @click="showPw = !showPw"
        ) {{ showPw ? t('login.hidePassword') : t('login.showPassword') }}

      .login-card__row
        label.checkbox
          input.checkbox__input(v-model="form.remember" type="checkbox")
          span.checkbox__box(aria-hidden="true")
          span.checkbox__text {{ t('login.remember') }}
        RouterLink.text-link(:to="memberHelp") {{ t('login.forgot') }}

      button.btn.btn--primary.btn--block.btn--lg.login-card__submit(
        type="submit"
        :disabled="submitting"
      )
        | {{ submitting ? t('login.submitting') : t('login.submit') }}
      hr.login-card__rule
      .login-card__row
        span.login-card__hint {{ t('login.noAccount') }}
        RouterLink.btn.btn--outline(:to="{ name: 'register' }") {{ t('login.register') }}

    aside.login__aside
      span.login__image(
        :style="{ backgroundImage: `linear-gradient(rgba(20,40,30,.25), rgba(20,40,30,.25)), url(${media.fieldBanner})` }"
        aria-hidden="true"
      )
      InfoPanel(:title="t('login.featuresTitle')" size="lg")
        ul.dot-list
          li(v-for="f in features()" :key="f") {{ f }}
      InfoPanel(:title="t('login.helpTitle')" tone="card")
        address.login__address
          | {{ t('site.company') }}
          br
          | {{ t('site.address') }}
        RouterLink.text-link(:to="memberHelp") {{ t('login.helpLink') }}
</template>

<style scoped lang="scss">
.login {
  @include auto-grid(320px, 28px);
  align-items: start;
  padding-top: 48px;

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__image {
    min-height: 200px;
    background-size: cover;
    background-position: center;
  }

  &__address {
    font-style: normal;
    font-size: 13px;
  }
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 40px;
  border: 1px solid $c-line;
  background: $c-white;

  @include below(sm) {
    padding: 28px 20px;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    font-family: $f-serif;
    font-size: 30px;
    font-weight: 900;
    color: $c-ink;
  }

  &__lead {
    font-size: 14px;
    line-height: 1.8;
    color: $c-muted;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 13px;
  }

  &__hint {
    font-size: 14px;
    color: $c-text;
  }

  &__submit {
    @include hover {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: progress;
    }
  }

  &__rule {
    margin: 0;
    border: 0;
    height: 1px;
    background: $c-line-soft-2;
  }

  .field__input {
    padding: 14px 16px;
  }
}
</style>
