<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    placeholder: string
    /** 螢幕閱讀器用標籤 */
    label: string
    /** boxed：深色粗框＋篩選鈕；plain：細框大輸入；compact：首頁小搜尋 */
    variant?: 'boxed' | 'plain' | 'compact'
  }>(),
  { variant: 'plain' },
)

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [value: string] }>()
const id = useId()
const { t } = useI18n()
</script>

<template lang="pug">
form.search-field(
  :class="`search-field--${variant}`"
  role="search"
  @submit.prevent="emit('submit', model.trim())"
)
  label.visually-hidden(:for="id") {{ label }}
  input.search-field__input(
    :id="id"
    v-model="model"
    type="search"
    :placeholder="placeholder"
    autocomplete="off"
  )
  button.search-field__button(v-if="variant === 'boxed'" type="submit") {{ t('common.filter') }}
</template>

<style scoped lang="scss">
.search-field {
  display: flex;
  min-width: 0;

  &__input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: $c-white;
    color: $c-ink;
    font-size: 15px;

    &::-webkit-search-cancel-button {
      cursor: pointer;
    }
  }

  &__button {
    @include button-reset;
    background: $c-primary;
    color: $c-paper;
    padding: 13px 18px;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    @include focus-ring($c-ink);
  }

  &--boxed {
    border: 1.5px solid $c-ink;
    background: $c-white;

    .search-field__input {
      padding: 13px 14px;
    }

    &:focus-within {
      box-shadow: 0 0 0 3px rgba(6, 113, 122, 0.25);
    }
  }

  &--plain {
    flex: 1;
    min-width: min(240px, 100%);

    .search-field__input {
      border: 1px solid $c-line-2;
      padding: 13px 16px;

      &:focus {
        border-color: $c-primary;
      }
    }
  }

  &--compact .search-field__input {
    width: 150px;
    border: 1px solid $c-line-2;
    padding: 8px 14px;
    font-size: 13px;

    &:focus {
      border-color: $c-primary;
    }
  }
}
</style>
