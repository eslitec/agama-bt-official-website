<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FormField from '@/components/common/FormField.vue'
import InfoPanel from '@/components/common/InfoPanel.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { adminApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useAdminRequest } from '@/composables/useAdmin'
import { useFormErrors } from '@/composables/useFormErrors'
import { isAdminPassword, isAdminUsername, isBlank } from '@/utils/validators'
import type { AdminAccount } from '@/types/models'

const { t, locale } = useI18n()
const auth = useAuthStore()
const { run, messageOf } = useAdminRequest()

const aria = (error: string, id: string) =>
  error ? { 'aria-invalid': 'true' as const, 'aria-describedby': `${id}-error` } : {}
const requiredMsg = (label: string): string => t('validation.required', { field: label })
const passwordRule = (value: string, label: string): string | null =>
  !value ? requiredMsg(label) : isAdminPassword(value) ? null : t('validation.password')

/* ───────── 修改密碼 ───────── */

const pw = reactive({ current: '', next: '', confirm: '' })
const pwIds = { current: 'pw-current', next: 'pw-next', confirm: 'pw-confirm' }
const pwEl = ref<HTMLFormElement | null>(null)
const pwBusy = ref(false)
const pwError = ref('')
const pwDone = ref('')
const pwRules = useFormErrors({
  current: () => (pw.current ? null : requiredMsg(t('admin.account.currentPassword'))),
  next: () => passwordRule(pw.next, t('admin.account.newPassword')),
  confirm: () => (pw.confirm === pw.next ? null : t('validation.passwordConfirm')),
})

async function changePassword(): Promise<void> {
  if (pwBusy.value) return
  pwError.value = ''
  pwDone.value = ''
  if (!(await pwRules.validate(pwEl.value, (k) => pwIds[k]))) return
  pwBusy.value = true
  try {
    await run((token) => adminApi.changePassword(token, pw.current, pw.next))
    Object.assign(pw, { current: '', next: '', confirm: '' })
    pwDone.value = t('admin.account.passwordChanged')
  } catch (e) {
    pwError.value = messageOf(e)
  } finally {
    pwBusy.value = false
  }
}

/* ───────── 管理者列表 ───────── */

const admins = ref<AdminAccount[]>([])
const listLoading = ref(false)
const listError = ref('')
const listNotice = ref('')

async function loadAdmins(): Promise<void> {
  listLoading.value = true
  listError.value = ''
  try {
    admins.value = (await run(adminApi.listAdmins)).admins
  } catch (e) {
    listError.value = messageOf(e)
  } finally {
    listLoading.value = false
  }
}
onMounted(loadAdmins)

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(locale.value === 'zh-TW' ? 'zh-TW' : 'en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
}

const removing = ref<AdminAccount | null>(null)
const removeBusy = ref(false)
const removeError = ref('')

function askRemove(a: AdminAccount): void {
  removeError.value = ''
  removing.value = a
}

async function confirmRemove(): Promise<void> {
  const target = removing.value
  if (!target || removeBusy.value) return
  removeBusy.value = true
  removeError.value = ''
  try {
    await run((token) => adminApi.removeAdmin(token, target.username))
    removing.value = null
    listNotice.value = t('admin.account.removed', { name: target.username })
    await loadAdmins()
  } catch (e) {
    removeError.value = messageOf(e)
  } finally {
    removeBusy.value = false
  }
}

/* ───────── 新增管理者 ───────── */

const add = reactive({ username: '', password: '', confirm: '' })
const addIds = { username: 'add-username', password: 'add-password', confirm: 'add-confirm' }
const addEl = ref<HTMLFormElement | null>(null)
const addBusy = ref(false)
const addError = ref('')
const addRules = useFormErrors({
  username: () =>
    isBlank(add.username)
      ? requiredMsg(t('login.username'))
      : isAdminUsername(add.username)
        ? null
        : t('validation.username'),
  password: () => passwordRule(add.password, t('login.password')),
  confirm: () => (add.confirm === add.password ? null : t('validation.passwordConfirm')),
})

async function addAdmin(): Promise<void> {
  if (addBusy.value) return
  addError.value = ''
  listNotice.value = ''
  if (!(await addRules.validate(addEl.value, (k) => addIds[k]))) return
  addBusy.value = true
  const username = add.username.trim().toLowerCase()
  try {
    await run((token) => adminApi.addAdmin(token, username, add.password))
    Object.assign(add, { username: '', password: '', confirm: '' })
    listNotice.value = t('admin.account.added', { name: username })
    await loadAdmins()
  } catch (e) {
    addError.value = messageOf(e)
  } finally {
    addBusy.value = false
  }
}
</script>

<template lang="pug">
section.account
  h1.account__title {{ t('admin.account.title') }}
  .account__grid
    //- 修改密碼
    form.account__card(ref="pwEl" novalidate @submit.prevent="changePassword")
      h2.account__heading {{ t('admin.account.passwordTitle') }}
      p.form-alert(v-if="pwError" role="alert") {{ pwError }}
      p.form-alert.form-alert--success(v-if="pwDone" role="status") {{ pwDone }}
      input.visually-hidden(
        type="text"
        autocomplete="username"
        :value="auth.username"
        tabindex="-1"
        aria-hidden="true"
        readonly
      )
      FormField(
        :id="pwIds.current"
        :label="t('admin.account.currentPassword')"
        :error="pwRules.errors.current"
        required
      )
        input.field__input(
          :id="pwIds.current"
          v-model="pw.current"
          v-bind="aria(pwRules.errors.current, pwIds.current)"
          type="password"
          autocomplete="current-password"
        )
      FormField(
        :id="pwIds.next"
        :label="t('admin.account.newPassword')"
        :error="pwRules.errors.next"
        required
      )
        input.field__input(
          :id="pwIds.next"
          v-model="pw.next"
          v-bind="aria(pwRules.errors.next, pwIds.next)"
          type="password"
          autocomplete="new-password"
          :placeholder="t('login.passwordHint')"
        )
      FormField(
        :id="pwIds.confirm"
        :label="t('admin.account.confirmPassword')"
        :error="pwRules.errors.confirm"
        required
      )
        input.field__input(
          :id="pwIds.confirm"
          v-model="pw.confirm"
          v-bind="aria(pwRules.errors.confirm, pwIds.confirm)"
          type="password"
          autocomplete="new-password"
        )
      button.btn.btn--primary(type="submit" :disabled="pwBusy")
        | {{ pwBusy ? t('admin.account.passwordSubmitting') : t('admin.account.passwordSubmit') }}

    //- 管理者帳號
    .account__card
      h2.account__heading {{ t('admin.account.adminsTitle') }}
      p.account__lead {{ t('admin.account.adminsLead') }}
      p.form-alert(v-if="listError" role="alert")
        | {{ listError }}
        |
        button.text-link(type="button" @click="loadAdmins") {{ t('common.retry') }}
      p.form-alert.form-alert--success(v-if="listNotice" role="status") {{ listNotice }}
      p.account__lead(v-if="listLoading && !admins.length") {{ t('common.loading') }}
      ul.admin-accounts(v-if="admins.length")
        li.admin-accounts__item(v-for="a in admins" :key="a.username")
          .admin-accounts__info
            strong.admin-accounts__name {{ a.username }}
            span.admin-accounts__meta
              | {{ t('admin.account.createdAt', { date: formatDate(a.createdAt) }) }}
          span.admin-accounts__self(v-if="a.username === auth.username") {{ t('admin.account.self') }}
          button.btn.btn--danger.btn--sm(
            v-else
            type="button"
            :aria-label="t('admin.account.removeLabel', { name: a.username })"
            @click="askRemove(a)"
          ) {{ t('admin.account.remove') }}

      form.account__add(ref="addEl" novalidate @submit.prevent="addAdmin")
        h3.account__subheading {{ t('admin.account.addTitle') }}
        p.form-alert(v-if="addError" role="alert") {{ addError }}
        FormField(
          :id="addIds.username"
          :label="t('login.username')"
          :error="addRules.errors.username"
          required
        )
          input.field__input(
            :id="addIds.username"
            v-model.trim="add.username"
            v-bind="aria(addRules.errors.username, addIds.username)"
            type="text"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            maxlength="32"
            :placeholder="t('login.usernameHint')"
          )
        FormField(
          :id="addIds.password"
          :label="t('login.password')"
          :error="addRules.errors.password"
          required
        )
          input.field__input(
            :id="addIds.password"
            v-model="add.password"
            v-bind="aria(addRules.errors.password, addIds.password)"
            type="password"
            autocomplete="new-password"
            :placeholder="t('login.passwordHint')"
          )
        FormField(
          :id="addIds.confirm"
          :label="t('login.passwordConfirm')"
          :error="addRules.errors.confirm"
          required
        )
          input.field__input(
            :id="addIds.confirm"
            v-model="add.confirm"
            v-bind="aria(addRules.errors.confirm, addIds.confirm)"
            type="password"
            autocomplete="new-password"
          )
        button.btn.btn--outline(type="submit" :disabled="addBusy")
          | {{ addBusy ? t('admin.account.adding') : t('admin.account.addSubmit') }}

  InfoPanel(:title="t('login.forgotTitle')")
    p {{ t('login.forgotBody') }}

  ConfirmDialog(
    :open="!!removing"
    :title="t('admin.account.removeTitle')"
    :confirm-text="removeBusy ? t('admin.account.removing') : t('admin.account.removeConfirm')"
    :cancel-text="t('admin.cancel')"
    :busy="removeBusy"
    :error="removeError"
    danger
    @confirm="confirmRemove"
    @cancel="removing = null"
  )
    p(v-if="removing") {{ t('admin.account.removeBody', { name: removing.username }) }}
</template>

<style scoped lang="scss">
.account {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  &__title {
    font-family: $f-serif;
    font-size: clamp(24px, 4.5vw, 30px);
    font-weight: 900;
    color: $c-ink;
  }

  &__grid {
    @include auto-grid(320px, 20px);
    align-items: start;
  }

  &__card,
  &__add {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    min-width: 0;
  }

  &__card {
    padding: 28px;
    border: 1px solid $c-line;
    background: $c-white;

    @include below(sm) {
      padding: 22px 16px;
    }

    > .btn {
      align-self: flex-start;
    }
  }

  &__add {
    padding-top: 18px;
    border-top: 1px solid $c-line-soft-2;

    > .btn {
      align-self: flex-start;
    }
  }

  &__heading {
    font-size: 18px;
    font-weight: 900;
    color: $c-ink;
  }

  &__subheading {
    font-size: 15px;
    font-weight: 700;
    color: $c-ink;
  }

  &__lead {
    font-size: 13px;
    line-height: 1.8;
    color: $c-muted;
  }
}

.admin-accounts {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid $c-line-soft;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $c-line-soft;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    color: $c-ink;
    overflow-wrap: anywhere;
  }

  &__meta {
    font-size: 12px;
    color: $c-muted;
  }

  &__self {
    padding: 3px 8px;
    background: #e8f3f3;
    font-size: 12px;
    font-weight: 700;
    color: $c-primary-dark;
    white-space: nowrap;
  }
}
</style>
