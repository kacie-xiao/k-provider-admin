<script name="my-load-button" lang="ts" setup>
import type { Size, Type } from 'naive-ui/es/button/src/interface';
import { ref } from 'vue';

const $props = defineProps<{
  loadFn: () => Promise<any>;
  size: Size;
  type: Type;
}>();

const load = ref(false);

function click() {
  if (!$props.loadFn) return;
  load.value = true;
  $props.loadFn().finally(() => {
    load.value = false;
  });
}
</script>
<template>
  <n-button :size="size" :type="type" :loading="load" :disabled="load" @click="click">
    <slot></slot>
  </n-button>
</template>
