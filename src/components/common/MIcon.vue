<script setup lang="ts">
import { computed } from 'vue'
import { icons } from './icons'

const props = defineProps<{
  /** Material Symbols Rounded 圖示名稱（見 icons.ts） */
  name: string
  size?: number
}>()

const svg = computed(() => icons[props.name] ?? '')

if (import.meta.env.DEV) {
  if (!icons[props.name]) console.warn(`[MIcon] 未註冊的圖示：${props.name}`)
}
</script>

<template lang="pug">
//- eslint-disable-next-line vue/no-v-html -- 內容為本地打包的 SVG 圖示
span.m-icon(aria-hidden="true" :style="size ? { fontSize: `${size}px` } : undefined" v-html="svg")
</template>

<style scoped lang="scss">
:where(.m-icon) {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  // 寬 1em、高約 1.22em：與設計稿圖示字型的行框一致
  width: 1em;
  height: 1.22em;
  font-size: 24px;
  line-height: 1;

  :deep(svg) {
    width: 1em;
    height: 1em;
    display: block;
  }
}
</style>
