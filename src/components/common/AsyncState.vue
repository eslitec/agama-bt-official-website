<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ loading: boolean; error: Error | null }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()
</script>

<template lang="pug">
.async-state(v-if="error" role="alert")
  span {{ t('common.loadError') }}
  button.text-link(type="button" @click="$emit('retry')") {{ t('common.retry') }}
.async-state.async-state--loading(v-else-if="loading" aria-busy="true")
  span.visually-hidden {{ t('common.loading') }}
slot(v-else)
</template>

<style scoped lang="scss">
.async-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid $c-line;
  background: $c-white;
  font-size: 14px;
  color: $c-muted;

  &--loading {
    min-height: 120px;
    border: 0;
    background: transparent;
  }
}
</style>
