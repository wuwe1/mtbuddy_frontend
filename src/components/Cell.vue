<script setup lang="ts">
const { label, value } = defineProps<{
  label: string
  value: number | string
}>()
</script>

<template>
  <div flex justify-between text-sm border-b class="dark:border-slate-600/75">
    <span px-1>{{ label }}</span>
    <span px-1 text-blue-500>{{ value }}</span>
  </div>
</template>
