<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FormField from '@/components/common/FormField.vue'
import { useAuthStore } from '@/stores/auth'
import { useFormErrors } from '@/composables/useFormErrors'
import { adminErrorMessage } from '@/composables/useAdmin'
import { adminApi } from '@/api'
import { AdminApiError } from '@/api/modules/admin'
import { isAdminPassword, isAdminUsername, isBlank } from '@/utils/validators'
import { media } from '@/utils/media'
import { safeRedirect } from '@/utils/redirect'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** 正式網址或開發模擬後台可用；正式環境未設定網址時停用表單 */
const available = adminApi.isAdminAvailable()
const mock = adminApi.isAdminMock()
// 模擬後台的示範帳號（只在開發環境打包，與 src/api/admin-mock.ts 的 MOCK_ADMIN 相同）
const demoAccount = import.meta.env.DEV ? { username: 'admin', password: 'admin12345' } : {}
const expired = computed(() => route.query.expired === '1')

/** login：一般登入；setup：尚無管理者時的初次設定 */
const mode = ref<'login' | 'setup'>('login')
const form = reactive({
  setupCode: '',
  username: '',
  password: '',
  passwordConfirm: '',
  remember: false,
})
const showPw = ref(false)
const submitting = ref(false)
const formError = ref('')
const formEl = ref<HTMLFormElement | null>(null)

const ids = {
  setupCode: 'login-setup-code',
  username: 'login-username',
  password: 'login-password',
  passwordConfirm: 'login-password-confirm',
} as const

const required = (value: string, label: string): string | null =>
  isBlank(value) ? t('validation.required', { field: label }) : null

const loginRules = useFormErrors({
  username: () => required(form.username, t('login.username')),
  password: () => (form.password ? null : t('validation.required', { field: t('login.password') })),
})

const setupRules = useFormErrors({
  setupCode: () => required(form.setupCode, t('login.setupCode')),
  username: () =>
    required(form.username, t('login.username')) ??
    (isAdminUsername(form.username) ? null : t('validation.username')),
  password: () =>
    (form.password ? null : t('validation.required', { field: t('login.password') })) ??
    (isAdminPassword(form.password) ? null : t('validation.password')),
  passwordConfirm: () =>
    form.passwordConfirm === form.password ? null : t('validation.passwordConfirm'),
})

// 目前模式的錯誤訊息（兩組規則的欄位不同）
const errors = computed<Record<string, string>>(() =>
  mode.value === 'setup' ? setupRules.errors : loginRules.errors,
)
const aria = (key: keyof typeof ids) =>
  errors.value[key]
    ? { 'aria-invalid': 'true' as const, 'aria-describedby': `${ids[key]}-error` }
    : {}
function recheck(key: keyof typeof ids): void {
  if (!errors.value[key]) return
  if (mode.value === 'setup') setupRules.check(key)
  else if (key === 'username' || key === 'password') loginRules.check(key)
}

onMounted(async () => {
  if (!available) return
  try {
    const { needsSetup } = await adminApi.setupStatus()
    if (needsSetup) mode.value = 'setup'
  } catch {
    /* 讀不到狀態時維持登入表單，送出時再顯示錯誤 */
  }
})

async function onSubmit(): Promise<void> {
  if (submitting.value || !available) return
  formError.value = ''
  const rules = mode.value === 'setup' ? setupRules : loginRules
  const ok = await rules.validate(formEl.value, (k) => ids[k as keyof typeof ids])
  if (!ok) return
  submitting.value = true
  try {
    if (mode.value === 'setup') await auth.setup({ ...form })
    else await auth.login({ ...form })
    await router.push(safeRedirect(route.query.redirect) ?? { name: 'adminNews' })
  } catch (e) {
    if (e instanceof AdminApiError && e.code === 'SETUP_DONE') mode.value = 'login'
    formError.value = adminErrorMessage(e, t)
  } finally {
    submitting.value = false
  }
}

const title = computed(() => (mode.value === 'setup' ? t('login.setupTitle') : t('login.title')))
const submitText = computed(() => {
  if (mode.value === 'setup')
    return submitting.value ? t('login.setupSubmitting') : t('login.setupSubmit')
  return submitting.value ? t('login.submitting') : t('login.submit')
})
const asideImage = {
  backgroundImage: `linear-gradient(rgba(20,40,30,.25), rgba(20,40,30,.25)), url(${media.fieldBanner})`,
}
</script>

<template lang="pug">
.page.l-section
  .login.l-container
    form.login-card(ref="formEl" novalidate @submit.prevent="onSubmit")
      header.login-card__head
        span.login-card__eyebrow {{ t('login.eyebrow') }}
        h1.login-card__title {{ title }}
        p.login-card__lead(v-if="mode === 'setup'") {{ t('login.setupLead') }}
        p.login-card__lead(v-else) {{ t('login.lead') }}

      p.form-alert(v-if="!available" role="alert") {{ t('login.notConfigured') }}
      p.form-alert.form-alert--info(v-if="mock") {{ t('login.demo', demoAccount) }}
      p.form-alert.form-alert--info(v-if="expired && !formError" role="status") {{ t('login.expired') }}
      p.form-alert(v-if="formError" role="alert") {{ formError }}

      fieldset.login-card__fields(:disabled="!available")
        FormField(
          v-if="mode === 'setup'"
          :id="ids.setupCode"
          :label="t('login.setupCode')"
          :error="errors.setupCode"
          required
        )
          input.field__input(
            :id="ids.setupCode"
            v-model.trim="form.setupCode"
            v-bind="aria('setupCode')"
            type="text"
            autocomplete="one-time-code"
            autocapitalize="characters"
            spellcheck="false"
            :placeholder="t('login.setupCodePlaceholder')"
            @blur="recheck('setupCode')"
          )
        FormField(
          :id="ids.username"
          :label="t('login.username')"
          :error="errors.username"
          required
        )
          input.field__input(
            :id="ids.username"
            v-model.trim="form.username"
            v-bind="aria('username')"
            type="text"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            maxlength="32"
            :placeholder="mode === 'setup' ? t('login.usernameHint') : t('login.usernamePlaceholder')"
            @blur="recheck('username')"
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
            v-bind="aria('password')"
            :type="showPw ? 'text' : 'password'"
            :autocomplete="mode === 'setup' ? 'new-password' : 'current-password'"
            :placeholder="mode === 'setup' ? t('login.passwordHint') : t('login.passwordPlaceholder')"
            @blur="recheck('password')"
          )
          button.field__addon(
            type="button"
            :aria-controls="ids.password"
            :aria-pressed="showPw"
            @click="showPw = !showPw"
          ) {{ showPw ? t('login.hidePassword') : t('login.showPassword') }}
        FormField(
          v-if="mode === 'setup'"
          :id="ids.passwordConfirm"
          :label="t('login.passwordConfirm')"
          :error="errors.passwordConfirm"
          required
        )
          input.field__input(
            :id="ids.passwordConfirm"
            v-model="form.passwordConfirm"
            v-bind="aria('passwordConfirm')"
            :type="showPw ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="t('login.passwordConfirmPlaceholder')"
            @blur="recheck('passwordConfirm')"
          )

        label.checkbox
          input.checkbox__input(v-model="form.remember" type="checkbox")
          span.checkbox__box(aria-hidden="true")
          span.checkbox__text {{ t('login.remember') }}

        button.btn.btn--primary.btn--block.btn--lg.login-card__submit(
          type="submit"
          :disabled="submitting || !available"
        ) {{ submitText }}

    aside.login__aside
      span.login__image(:style="asideImage" aria-hidden="true")
</template>

<style scoped lang="scss">
.login {
  @include auto-grid(320px, 28px);
  align-items: start;
  padding-top: 48px;

  &__aside {
    display: flex;
    flex-direction: column;
    align-self: stretch;
  }

  &__image {
    flex: 1;
    min-height: 220px;
    background-size: cover;
    background-position: center;
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

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 22px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;

    &:disabled {
      opacity: 0.6;
    }
  }

  &__submit {
    @include hover {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .field__input {
    padding: 14px 16px;
  }
}
</style>
