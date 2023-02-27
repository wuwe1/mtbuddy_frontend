<script setup lang="ts">
const { label } = defineProps<{
  label: string
}>()
const { modelValue } = defineModel<{
  modelValue: string | number
}>()
</script>

<template>
  <div flex justify-between text-sm border-b class="dark:border-slate-600/75">
    <span px-1>{{ label }}</span>
    <input
      id="input"
      v-model="modelValue"
      v-bind="$attrs"
      h-full
      text-right
      type="text"
      px-2 py-1 w="1/2"
      bg="transparent"
      border="~ gray-200 dark:gray-700"
      border-y-0 border-r-0
      outline="none active:none"
      style="height: 1.25rem"
    >
    <!-- TODO: better styling of web form -->
  </div>
</template>
