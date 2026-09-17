<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  lead?: string
  /** 標題與導言的語系（資料只有中文時用） */
  contentLang?: string
}>()
</script>

<template lang="pug">
header.page-heading
  slot(name="before")
  span.page-heading__eyebrow {{ eyebrow }}
  h1.page-heading__title(:lang="contentLang") {{ title }}
  p.page-heading__lead(v-if="lead || $slots.lead" :lang="contentLang")
    slot(name="lead") {{ lead }}
</template>

<style scoped lang="scss">
.page-heading {
  padding-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    font-family: $f-serif;
    font-size: clamp(28px, 5vw, 34px);
    font-weight: 900;
    line-height: 1.4;
    color: $c-ink;
  }

  &__lead {
    font-size: 14px;
    line-height: 1.85;
    color: $c-muted;
  }
}
</style>
