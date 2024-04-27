<template>
  <div class="el-upload-list el-upload-list--picture-card">
    <n-image-group>
      <n-space v-if="isShowList">
        <div
          v-for="(item, index) in filelist"
          :key="item"
          :style="{ width: setStyle(width), height: setStyle(height) }"
          class="relative shadow"
        >
          <n-image :src="item" class="w-full h-full rounded" object-fit="contain" alt="" />
          <div
            v-if="!disabled"
            class="absolute -top-1 -right-1 rounded-full w-6 h-6 flex justify-center items-center cursor-pointer shadow"
            style="background-color: red"
            @click="onDelete(index)"
          >
            <n-icon class="text-white"> <close /> </n-icon>
          </div>
        </div>
      </n-space>
    </n-image-group>

    <template v-if="!disabled">
      <div
        v-if="filelist.length < max"
        :style="{ width: setStyle(width), height: setStyle(height) }"
        class="el-upload el-upload--picture-card"
        :class="[filelist.length ? 'ml-4' : '']"
        @click="selectFile"
      >
        <n-spin :show="loading">
          <div class="upload-centont">
            <svg-icon :name="icon"></svg-icon>
            <div v-if="tip">{{ tip }}</div>
          </div>
          <input
            ref="uploadfileRef"
            accept="image/png,image/jpeg"
            class="el-upload__input"
            type="file"
            @change="filesChange"
          />
        </n-spin>
      </div>
    </template>
    <template v-else>
      <div
        v-if="!filelist.length"
        :style="{ width: setStyle(width), height: setStyle(height) }"
        class="el-upload el-upload--picture-card is-disabled"
        :class="[filelist.length ? 'ml-4' : '']"
      >
        <div class="upload-centont">
          <svg-icon :name="icon"></svg-icon>
        </div>
      </div>
    </template>
  </div>
  <cropper-dialog
    ref="cropperDialogRef"
    :aspect-ratio-list="aspectRatioList"
    :max-size="maxSize"
    :only-cropper="!autoUpload"
    @cropper-end="cropperEnd"
    @up-cropper-img="selectFile"
  />
</template>

<script name="upload-image" lang="ts" setup>
import { Close } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { computed, ref } from 'vue';

import CropperDialog, { aspectRatioInterface } from '@/components/cropper/index.vue';
import SvgIcon from '@/components/svgIcon/index.vue';
import { AilUploadImage } from '@/utils/uploadFilesOss';

const $naiveMessage = useMessage();

// @ts-ignore
const $props = withDefaults(
  defineProps<{
    width: string | number;
    height: string | number;
    modelValue: string | string[];
    max?: number;
    maxSize?: number;
    tip?: string;
    icon?: string;
    /**
     * 是否自动上传
     */
    autoUpload?: boolean;
    /**
     * 上传函数
     */
    uploadMethod?: (file: File) => Promise<string>;
    /**
     * 是否需要剪裁
     */
    cropper?: aspectRatioInterface[];
    isShowList?: boolean;
    disabled: boolean;
  }>(),
  {
    width: 150,
    height: 150,
    max: Infinity,
    maxSize: Infinity,
    icon: 'ele-Picture',
    autoUpload: true,
    isShowList: true,
    disabled: false,
    tip: '上传',
  },
);

const $emits = defineEmits<{
  (event: 'update:modelValue', value: typeof $props.modelValue): void;
}>();

const loading = ref(false);
const cropperDialogRef = ref<InstanceType<typeof CropperDialog>>();
const uploadfileRef = ref<HTMLInputElement | undefined>();
const filelist = computed<string[]>({
  get() {
    if (Array.isArray($props.modelValue)) {
      return $props.modelValue;
    }
    if ($props.modelValue) {
      return [$props.modelValue];
    }
    return [];
  },
  set(value: string[]) {
    if (Array.isArray($props.modelValue)) {
      $emits('update:modelValue', value);
    } else if (value[0]) {
      $emits('update:modelValue', value[0]);
    } else {
      $emits('update:modelValue', '');
    }
  },
});

// 选择文件
function selectFile() {
  if ($props.disabled) return;
  uploadfileRef.value!.value = '';
  uploadfileRef.value?.click();
}

// 设置样式
function setStyle(param: number | string) {
  return typeof param === 'number' ? `${param}px` : param;
}

// 添加文件
function filesChange(event: Event) {
  const file = (event.target as HTMLInputElement).files![0];
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    $naiveMessage.error('不支持该格式文件');
    return (uploadfileRef.value!.value = '');
  }
  if (file.size > $props.maxSize) {
    $naiveMessage.warning(`图片的大小不能超过${$props.maxSize / 1024 / 1024}M,请重新选择`);
    return (uploadfileRef.value!.value = '');
  }

  loading.value = true;
  if ($props.autoUpload) {
    if ($props.uploadMethod) {
      $props
        .uploadMethod(file)
        .then((url) => {
          if ($props.cropper) {
            cropperDialogRef.value?.openDialog(url);
          } else {
            cropperEnd(url);
          }
        })
        .catch(() => {
          $naiveMessage.error('图片上传失败，请重新上传');
          uploadfileRef.value!.value = '';
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      AilUploadImage(file)
        .then((url) => {
          if ($props.cropper) {
            cropperDialogRef.value?.openDialog(url);
          } else {
            cropperEnd(url);
          }
        })
        .catch(() => {
          $naiveMessage.error('图片上传失败，请重新上传');
          uploadfileRef.value!.value = '';
        })
        .finally(() => {
          loading.value = false;
        });
    }
  } else {
    const url = URL.createObjectURL(file);
    if ($props.cropper) {
      cropperDialogRef.value?.openDialog(url, file.type);
    } else {
      cropperEnd(url);
    }
    loading.value = false;
  }
}

// 删除文件
function onDelete(index: number) {
  filelist.value = filelist.value.filter((item, idx) => {
    return idx !== index;
  });
}

// 剪裁完成
function cropperEnd(url: string) {
  filelist.value = [...filelist.value, url];
  uploadfileRef.value!.value = '';
}

const aspectRatioList = computed<aspectRatioInterface[] | undefined>(() => {
  if ($props.cropper) {
    return $props.cropper;
  }
  return undefined;
});

// function onPrev(index: number) {
//   const arr: string[] = filelist.value;
//   arr.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
//   filelist.value = arr;
// }
//
// function onNext(index: number) {
//   const arr: string[] = filelist.value;
//   arr.splice(index + 1, 1, ...arr.splice(index, 1, arr[index + 1]));
//   filelist.value = arr;
// }
</script>

<style lang="scss" scoped>
.upload-centont {
  text-align: center;
  font-size: 12px;
  line-height: 2;
  color: var(--el-text-color-secondary);
}

.el-upload-list {
  position: relative;
}
</style>
