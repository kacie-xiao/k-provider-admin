<script lang="ts">
import { ElMessage } from 'element-plus';
import { useMessage } from 'naive-ui';
import { computed, defineComponent, ref } from 'vue';

import SvgIcon from '@/components/svgIcon/index.vue';
import VideoViewer from '@/components/videoViewer/index.vue';
import uploadVideoFn from '@/utils/aliyun-upload-sdk/index';

const $naiveMessage = useMessage();
export default defineComponent({
  name: 'UploadVideo',
  components: { VideoViewer, SvgIcon },
  props: {
    width: {
      type: [String, Number],
      default: 150,
    },
    height: {
      type: [String, Number],
      default: 150,
    },
    // 视频文件大小，默认无限制
    maxSize: {
      type: Number,
      default: 100 * 1024 * 1024,
    },
    // 最长时长，单位s
    maxTime: {
      type: Number,
      default: Infinity,
    },
    // 最短时长，单位s
    minTime: {
      type: Number,
      default: 1,
    },
    // 可上传视频数量
    max: {
      type: Number,
      default: Infinity,
    },
    modelValue: {
      type: String,
      default: '',
    },
    tip: {
      type: String,
      default: '点击上传视频',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const loading = ref(false);
    const progress = ref('0');

    const uploadVideo = new uploadVideoFn({
      onUploadstarted: () => {
        loading.value = true;
      },
      onUploadProgress: (progressNumber) => {
        progress.value = (progressNumber * 100).toFixed(2);
      },
      onUploadSucceed: (url: string) => {
        filelist.value = [...filelist.value, url];
        loading.value = false;
        progress.value = '0';
      },
    });

    const uploadfileRef = ref<HTMLInputElement | undefined>();
    const preview = ref<string | undefined>();
    const filelist = computed({
      get() {
        if (props.modelValue) {
          return props.modelValue.split(',');
        }
        return [];
      },
      set(value: string[]) {
        emit('update:modelValue', value.join());
      },
    });

    // 设置样式
    function setStyle(param: number | string) {
      return typeof param === 'number' ? `${param}px` : param;
    }

    // 选择文件
    function selectFile() {
      uploadfileRef.value!.value = '';
      uploadfileRef.value?.click();
    }

    // 预览图片
    function onPreview(index: number) {
      preview.value = filelist.value[index];
    }

    // 关闭预览
    function onPreviewClose() {
      preview.value = undefined;
    }

    // 添加文件
    function filesChange(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (file.size > props.maxSize) {
        return $naiveMessage.error('视频文件大小超过限制,请重新选择');
      }

      const video = new Audio(url);
      function listener(event: Event) {
        const { duration } = event.target as HTMLAudioElement;
        if (duration > props.maxTime) {
          ElMessage.warning(`视频时长不能超过${props.maxTime}`);
        } else if (duration < props.minTime) {
          ElMessage.warning(`视频时长不能少于${props.minTime}`);
        } else {
          uploadVideo.upload.addFile(file, null, null, null, JSON.stringify({ Vod: { Title: file.lastModified } }));
          uploadVideo.upload.startUpload();
          URL.revokeObjectURL(url);
          video.removeEventListener('loadedmetadata', listener);
        }
      }

      video.addEventListener('loadedmetadata', listener);
    }

    // 删除文件
    function onDelete(index: number) {
      filelist.value = filelist.value.filter((item, idx) => index !== idx);
    }

    return {
      onPreview,
      onPreviewClose,
      setStyle,
      selectFile,
      onDelete,
      filesChange,
      uploadfileRef,
      preview,
      filelist,
      loading,
      progress,
    };
  },
});
</script>
<template>
  <div class="el-upload-list el-upload-list--picture-card">
    <ul class="el-upload-list el-upload-list--picture-card">
      <li
        v-for="(item, index) in filelist"
        :key="index"
        :style="{ width: setStyle(width), height: setStyle(height) }"
        class="el-upload-list__item is-ready"
      >
        <video :src="item" class="el-upload-list__item-thumbnail"></video>
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview">
            <svg-icon name="ele-VideoPlay" size="1em" @click="onPreview(index)"></svg-icon>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete">
            <svg-icon name="ele-Delete" size="1em" @click="onDelete(index)"></svg-icon>
          </span>
        </span>
      </li>
    </ul>
    <div
      v-if="filelist.length < max"
      :style="{ width: setStyle(width), height: setStyle(height) }"
      class="el-upload el-upload--picture-card"
      @click="selectFile"
    >
      <div v-if="loading" class="v-upload-style cursor-not-allowed" @click.stop>
        <div class="loading-box">
          <div class="font16">{{ progress }}%</div>
          <div class="font12">正在上传</div>
        </div>
      </div>
      <div v-if="!loading" class="upload-centont">
        <svg-icon name="ele-VideoCamera"></svg-icon>
        <div v-if="tip">{{ tip }}</div>
      </div>
      <input ref="uploadfileRef" accept="video/mp4" class="el-upload__input" type="file" @change="filesChange" />
    </div>
  </div>
  <video-viewer v-if="preview" :src="preview" @close="onPreviewClose"> </video-viewer>
</template>

<style lang="scss" scoped>
.upload-centont {
  text-align: center;
  font-size: 12px;
  line-height: 2;
  color: var(--el-text-color-secondary);
  position: relative;
}

.v-upload-style {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: var(--el-overlay-color-lighter);

  .loading-box {
    position: relative;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--el-color-white);
    line-height: 1.5;

    &::before {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      box-sizing: border-box;
      border-radius: 50%;
      border: 3px solid rgba($color: #fff, $alpha: 0.5);
      transform: rotate(0deg);
      animation: rotate 3s infinite ease-out;
    }

    &::after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      box-sizing: border-box;
      border-radius: 50%;
      border-bottom: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #fff;
      border-left: 5px solid #fff;
      transform: rotate(0deg);
      animation: rotate 3s infinite linear;
    }

    @keyframes rotate {
      100% {
        transform: rotate(720deg);
      }
    }
  }
}
</style>
