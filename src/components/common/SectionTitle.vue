<script setup lang="ts">
import type { RevealEffect } from '@/directives/reveal'

withDefaults(
  defineProps<{
    title: string
    /** light：淺色底；on-image：壓在圖片上的白字 */
    tone?: 'light' | 'on-image'
  }>(),
  { tone: 'light' },
)

const headingEffect: RevealEffect = 'fade-right'
</script>

<template lang="pug">
.section-title(:class="`section-title--${tone}`")
  h2.section-title__heading(v-reveal="headingEffect") {{ title }}
  span.section-title__rule(aria-hidden="true")
  slot
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 14px 20px;
  flex-wrap: wrap;

  &__heading {
    font-size: 24px;
    font-weight: 900;
    color: $c-ink;
    white-space: nowrap;
  }

  &__rule {
    height: 2px;
    flex: 1;
    min-width: 20px;
    background: $c-accent;
  }

  &--on-image &__heading {
    color: $c-white;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.35);
  }

  &--on-image &__rule {
    background: rgba(255, 255, 255, 0.55);
  }
}
</style>
