<template>
  <template v-for="val in chils">
    <el-sub-menu
      :index="val.path"
      :key="val.path"
      v-if="val.children && val.children.length > 0"
    >
      <template #title>
        <svg-icon :name="val.meta.icon" />
        <span class="ml-2">{{ $t(val.meta.title) }}</span>
      </template>
      <sub-item :chil="val.children" />
    </el-sub-menu>
    <template v-else>
      <el-menu-item :index="val.path" :key="val.path">
        <template
          v-if="!val.meta.isLink || (val.meta.isLink && val.meta.isIframe)"
        >
          <svg-icon :name="val.meta.icon" />
          <span class="w-full ml-2">{{ $t(val.meta.title) }}</span>
        </template>
        <template v-else>
          <a class="w-full ml-2" @click.prevent="onALinkClick(val)">
            <svg-icon :name="val.meta.icon" />
            {{ $t(val.meta.title) }}
          </a>
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts" name="navMenuSubItem">
import { computed, defineAsyncComponent } from "vue";
import { RouteRecordRaw } from "vue-router";
import other from "@/utils/other";

const SvgIcon = defineAsyncComponent(
  () => import("@/components/svgIcon/index.vue"),
);

// 定义父组件传过来的值
const props = defineProps({
  // 菜单列表
  chil: {
    type: Array<RouteRecordRaw>,
    default: () => [],
  },
});

// 获取父级菜单数据
const chils = computed(() => {
  return <RouteItems>props.chil;
});
// 打开外部链接
const onALinkClick = (val: RouteItem) => {
  other.handleOpenLink(val);
};
</script>
