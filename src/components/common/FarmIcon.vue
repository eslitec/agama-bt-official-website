<script setup lang="ts">
import { computed } from 'vue'
import type { FarmIconKey } from '@/types/models'
import { farmIconPaths } from '@/utils/farm-icons'

const props = defineProps<{ icon: FarmIconKey }>()
const paths = computed(() => farmIconPaths[props.icon] ?? farmIconPaths.sprout)
</script>

<template lang="pug">
svg(
  width="26"
  height="26"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
)
  path(v-for="(d, i) in paths" :key="i" :d="d")
</template>
