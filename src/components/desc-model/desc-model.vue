<script name="desc-model" setup lang="ts">
import '@wangeditor/editor/dist/css/style.css';

import { Editor } from '@wangeditor/editor-for-vue';
import { computed, nextTick, reactive, ref } from 'vue';

import { getSystemConstDetail, getSystemDescDetail, getSystemDescDetailReturnInterface } from '@/api/global';

const $props = defineProps<{
  show: boolean;
  descKey: { [key: string]: string };
  rowKey: string;
}>();
const $emits = defineEmits<{ (evnet: 'update:show', value: boolean) }>();
const controller = computed({
  get() {
    return $props.show;
  },
  set(value: boolean) {
    $emits('update:show', value);
  },
});

const descDetail = reactive<{
  [key: string]: getSystemDescDetailReturnInterface;
}>({});
const loading = ref(false);
function openModel() {
  if (descDetail[$props.rowKey]) {
    return;
  }
  loading.value = true;
  getSystemConstDetail({ key: $props.descKey[$props.rowKey] })
    .then((res) => {
      getSystemDescDetail({ id: res.data.value as string }).then((resx) => {
        descDetail[$props.rowKey] = resx.data;
      });
    })
    .finally(() => {
      nextTick(() => {
        loading.value = false;
      });
    });
}
</script>

<template>
  <n-modal
    v-model:show="controller"
    title="示例"
    :show-icon="false"
    style="width: auto; max-width: none"
    preset="dialog"
    @after-enter="openModel"
  >
    <n-scrollbar style="width: 60vw; min-width: 600px; min-height: 400px; max-height: 80vh">
      <div v-if="loading" class="flex justify-center items-center" style="height: 400px">
        <n-spin :show="true" size="large"> </n-spin>
      </div>
      <template v-else>
        <div v-if="descDetail[rowKey]">
          <editor :model-value="descDetail[rowKey].desc" mode="default" :default-config="{ readOnly: true }" />
        </div>
      </template>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped lang="scss"></style>
