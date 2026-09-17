<script setup lang="ts">
defineProps<{
  /** 對應 input 的 id；錯誤訊息 id 為 `${id}-error` */
  id: string
  label: string
  error?: string
  required?: boolean
}>()
</script>

<template lang="pug">
.field(:class="{ 'is-invalid': !!error }")
  label.field__label(:for="id")
    | {{ label }}
    span.field__required(v-if="required" aria-hidden="true") *
  .field__control
    slot
  p.field__error(v-if="error" :id="`${id}-error`") {{ error }}
</template>
