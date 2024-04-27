<template>
  <div v-if="setShowLogo" class="layout-logo" @click="onThemeConfigChange">
    <img
      src="/src/assets/logo1.png"
      alt=""
    />
    <img
      class="ml-1"
      src="/src/assets/logo2.png"
      alt=""
    />
  </div>
  <div v-else class="layout-logo-size" @click="onThemeConfigChange">
    <img
      src="/src/assets/logo1.png"
      class="layout-logo-size-img"
    />
  </div>
</template>

<script setup lang="ts" name="layoutLogo">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useThemeConfig } from '@/stores/themeConfig';
// import logoMini from "@/assets/logo-mini.svg";

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 设置 logo 的显示。classic 经典布局默认显示 logo
const setShowLogo = computed(() => {
  const { isCollapse, layout } = themeConfig.value;
  return !isCollapse || layout === 'classic' || document.body.clientWidth < 1000;
});
// logo 点击实现菜单展开/收起
const onThemeConfigChange = () => {
  if (themeConfig.value.layout === 'transverse') return false;
  themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
};
</script>

<style scoped lang="scss">
.layout-logo {
  width: 220px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: rgb(0 21 41 / 2%) 0 1px 4px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  span {
    white-space: nowrap;
    display: inline-block;
  }

  &-medium-img {
    width: 20px;
    margin-right: 5px;
  }
}
.layout-logo-size {
  width: 100%;
  height: 50px;
  display: flex;
  cursor: pointer;
  &-img {
    width: 20px;
    margin: auto;
  }
}
</style>
