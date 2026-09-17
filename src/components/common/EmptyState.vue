<script setup lang="ts">
import MIcon from './MIcon.vue'

defineProps<{ message: string; icon?: string }>()
</script>

<template lang="pug">
.empty-state(role="status")
  MIcon.empty-state__icon(v-if="icon" :name="icon" :size="40")
  span {{ message }}
</template>

<style scoped lang="scss">
.empty-state {
  border: 1px solid $c-line;
  background: $c-white;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  font-size: 14px;
  line-height: 1.9;
  color: $c-muted;

  &__icon {
    color: $c-accent-soft;
  }
}
</style>
