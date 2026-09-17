<script setup lang="ts">
import { useCountUp } from '@/composables/useCountUp'

const props = withDefaults(defineProps<{ value: number; label: string; suffix?: string }>(), {
  suffix: '',
})
const { el, value: current } = useCountUp(props.value)
</script>

<template lang="pug">
.count-stat
  span.count-stat__value(ref="el") {{ current }}{{ suffix }}
  span.count-stat__label {{ label }}
</template>

<style scoped lang="scss">
.count-stat {
  border: 1px solid $c-line;
  background: $c-white;
  padding: 26px;
  display: flex;

  @include below(md) {
    padding: 18px 16px;
  }

  flex-direction: column;
  gap: 6px;

  &__value {
    font-size: clamp(28px, 7vw, 38px);
    font-weight: 900;
    white-space: nowrap;
    line-height: 1;
    color: $c-primary;
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 13px;
    color: $c-muted;
  }
}
</style>
