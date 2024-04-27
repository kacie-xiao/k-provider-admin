<template>
  <component :is="layouts[themeConfig.layout]" />
</template>

<script setup lang="ts" name="layout">
import { useDialog } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { defineAsyncComponent, onBeforeMount, onMounted, onUnmounted, reactive } from 'vue';

import { useThemeConfig } from '@/stores/themeConfig';
import mittBus from '@/utils/mitt';
import { Local } from '@/utils/storage';

const $naiveDialog = useDialog();
// 引入组件
const layouts: any = {
  defaults: defineAsyncComponent(() => import('@/layout/main/defaults.vue')),
  classic: defineAsyncComponent(() => import('@/layout/main/classic.vue')),
  transverse: defineAsyncComponent(() => import('@/layout/main/transverse.vue')),
  columns: defineAsyncComponent(() => import('@/layout/main/columns.vue')),
};

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 窗口大小改变时(适配移动端)
const onLayoutResize = () => {
  if (!Local.get('oldLayout')) Local.set('oldLayout', themeConfig.value.layout);
  const { clientWidth } = document.body;
  if (clientWidth < 1000) {
    themeConfig.value.isCollapse = false;
    mittBus.emit('layoutMobileResize', {
      layout: 'defaults',
      clientWidth,
    });
  } else {
    mittBus.emit('layoutMobileResize', {
      layout: Local.get('oldLayout') ? Local.get('oldLayout') : themeConfig.value.layout,
      clientWidth,
    });
  }
};

const timerConfig = reactive<{
  time: number;
  timer?: NodeJS.Timeout;
}>({
  time: 0,
  timer: undefined,
});

onMounted(() => {
  timerConfig.timer = setInterval(() => {
    timerConfig.time++;
  }, 1000);

  function addEventListenerClick() {
    if (timerConfig.time >= 60 * 60) {
      $naiveDialog.error({
        title: '重新加载',
        content: '用户长时间未操作，重新加载数据',
        showIcon: false,
        positiveText: '确认',
        onAfterLeave: () => {
          window.location.reload();
        },
      });
    }
    timerConfig.time = 0;
  }

  window.addEventListener('click', addEventListenerClick);
});
// 页面加载前
onBeforeMount(() => {
  onLayoutResize();
  window.addEventListener('resize', onLayoutResize);
});
// 页面卸载时
onUnmounted(() => {
  if (timerConfig.timer) {
    clearInterval(timerConfig.timer);
  }

  window.removeEventListener('resize', onLayoutResize);
});
</script>
