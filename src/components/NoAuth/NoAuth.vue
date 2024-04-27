<script name="no-auth" setup lang="ts">
import noPower from '@/views/error/401.vue';

withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);
</script>

<template>
  <div class="no-auth">
    <template v-if="show">
      <no-power type="api-no-power">
        <slot name="no-power"></slot>
      </no-power>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
