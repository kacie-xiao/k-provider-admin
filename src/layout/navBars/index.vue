<template>
  <div class="layout-navbars-container">
    <breadcrumb-index />
    <tags-view v-if="setShowTagsView" />
  </div>
</template>

<script setup lang="ts" name="layoutNavBars">
import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent } from 'vue';

import { useThemeConfig } from '@/stores/themeConfig';

// 引入组件
const BreadcrumbIndex = defineAsyncComponent(() => import('@/layout/navBars/topBar/index.vue'));
const TagsView = defineAsyncComponent(() => import('@/layout/navBars/tagsView/tagsView.vue'));

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 是否显示 tagsView
const setShowTagsView = computed(() => {
  const { layout, isTagsview } = themeConfig.value;
  return layout !== 'classic' && isTagsview;
});
</script>

<style scoped lang="scss">
.layout-navbars-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
