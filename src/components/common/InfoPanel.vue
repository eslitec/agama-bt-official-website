<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    /** sand：米色底；card：白底框 */
    tone?: 'sand' | 'card'
    /** 標題字級 */
    size?: 'md' | 'lg'
  }>(),
  { title: '', tone: 'sand', size: 'md' },
)
</script>

<template lang="pug">
section.info-panel(:class="[`info-panel--${tone}`, `info-panel--${size}`]")
  h2.info-panel__title(v-if="title") {{ title }}
  slot
</template>

<style scoped lang="scss">
.info-panel {
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.95;
  color: $c-text;

  &--sand {
    background: $c-sand;
  }

  &--card {
    border: 1px solid $c-line;
    background: $c-white;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.5;
    color: $c-ink;
  }

  &--lg &__title {
    font-size: 17px;
    font-weight: 900;
  }

  :slotted(ul) {
    margin: 0;
    padding: 0;
    list-style: none;
    line-height: 2;
  }
}
</style>
