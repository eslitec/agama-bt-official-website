<script setup lang="ts">
import { useScrollProgress } from '@/composables/useScrollProgress'

const { progress } = useScrollProgress()
</script>

<template lang="pug">
.scroll-progress(aria-hidden="true" :style="{ transform: `scaleX(${progress})` }")
</template>

<style scoped lang="scss">
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: $c-accent;
  transform-origin: 0 50%;
  z-index: $z-progress;
  pointer-events: none;
}
</style>
