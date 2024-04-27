<template>
  <n-modal
    v-model:show="isShowDialog"
    preset="dialog"
    title="图片剪裁"
    style="width: auto; max-width: none"
    :show-icon="false"
  >
    <div style="width: 50vw; min-width: 500px; max-width: 1000px">
      <div class="cropper-warp">
        <div class="cropper-warp-left">
          <img ref="cropperImgRef" :src="cropperImg" alt="" />
        </div>
      </div>
    </div>
    <template #action>
      <div class="w-full flex justify-between items-center">
        <n-space size="small">
          <n-button
            size="small"
            v-for="(item, index) in aspectRatioList"
            :key="index"
            :type="index === aspectRatioActive ? 'primary' : 'default'"
            @click="switchActive(index)"
          >
            {{ `${item.width} ` + ":" + ` ${item.height}` }}
          </n-button>
        </n-space>
        <n-space size="small">
          <n-button size="small" @click="closeDialog">取 消</n-button>
          <n-button
            size="small"
            v-if="upCropper"
            type="success"
            @click="upCropperImg"
          >
            重新选择
          </n-button>
          <n-button
            size="small"
            :disabled="cropperloading"
            :loading="cropperloading"
            type="primary"
            @click="cropperEnd"
          >
            完 成
          </n-button>
        </n-space>
      </div>
    </template>
  </n-modal>
</template>
<script lang="ts">
import {
  reactive,
  nextTick,
  ref,
  defineComponent,
  PropType,
  toRefs,
  shallowRef,
} from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ElMessage } from "element-plus";

export interface aspectRatioInterface {
  width: number;
  height: number;
}

interface canvasConfigInterface {
  height: number;
  rotate: number;
  scaleX: 1;
  scaleY: 1;
  width: number;
  x: number;
  y: number;
}

interface imageConfigInterface {
  aspectRatio: number;
  height: number;
  left: number;
  naturalHeight: number;
  naturalWidth: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  top: number;
  width: number;
}

export default defineComponent({
  name: "cropper",
  props: {
    title: {
      type: String,
      default: "剪裁图片",
    },
    aspectRatioList: {
      type: Array as PropType<aspectRatioInterface[]>,
      default: () => [{ width: 1, height: 1 }],
    },
    maxSize: {
      type: Number,
      default: () => Infinity,
    },
    /**
     * 本地图片剪裁
     */
    onlyCropper: {
      type: Boolean,
      default: () => false,
    },
    upCropper: { type: Boolean, default: () => true },
  },
  emits: ["cropperEnd", "upCropperImg"],
  setup(props, { emit }) {
    //初始化比例
    const aspectRatioActive = ref<number>(0);
    const cropperImgRef = shallowRef<HTMLImageElement>();
    const isShowDialog = ref<boolean>(false);
    const state = reactive({
      cropperImg: "",
      cropper: null,
      cropperloading: false,
      cropperType: "",
    });

    // 打开弹窗
    const openDialog = (url: string, type?: string) => {
      if (type) {
        state.cropperType = type;
      }
      if (cropperImgRef.value) {
        state.cropperImg = url;
        (state.cropper as any).replace(url);
        nextTick(() => {
          isShowDialog.value = true;
        });
      } else {
        state.cropperImg = url;
        isShowDialog.value = true;
        nextTick(() => {
          initCropper();
        });
      }
    };
    // 关闭弹窗
    const closeDialog = () => {
      isShowDialog.value = false;
      nextTick(() => {
        state.cropperImg = "";
        state.cropperType = "";
      });
    };

    //重新选择图片
    function upCropperImg() {
      emit("upCropperImg");
    }

    // 更换
    function cropperEnd() {
      state.cropperloading = true;
      if (props.onlyCropper) {
        (<any>state.cropper).getCroppedCanvas().toBlob((blob: Blob | null) => {
          if (blob) {
            if (blob.size < props.maxSize) {
              emit("cropperEnd", URL.createObjectURL(blob));
              URL.revokeObjectURL(state.cropperImg);
              state.cropperloading = false;
              closeDialog();
            } else {
              ElMessage.warning(
                `图片的大小不超过${props.maxSize / 1024 / 1024}M,请重新选择`,
              );
              state.cropperloading = false;
            }
          } else {
            ElMessage.error("剪裁失败");
            state.cropperloading = false;
          }
        }, state.cropperType);
      } else {
        const canvasConfig: canvasConfigInterface = (<any>(
          state.cropper
        )).getData(true);
        const imageConfig: imageConfigInterface = (<any>(
          state.cropper
        )).getImageData();
        if (
          canvasConfig.width === imageConfig.naturalWidth &&
          canvasConfig.height === imageConfig.naturalHeight
        ) {
          emit("cropperEnd", state.cropperImg);
          state.cropperloading = false;
          closeDialog();
        } else {
          let url = "";
          const { x, y, width, height } = canvasConfig;
          if (x === 0 && y === 0 && width === 0 && height === 0) {
            url = state.cropperImg;
          } else {
            url = `${state.cropperImg}?x-oss-process=image/crop,x_${canvasConfig.x},y_${canvasConfig.y},w_${canvasConfig.width},h_${canvasConfig.height},g_nw`;
          }
          emit("cropperEnd", url);
          state.cropperloading = false;
          closeDialog();
        }
      }
    }

    // 初始化cropperjs图片裁剪
    function initCropper() {
      if (cropperImgRef.value) {
        const item = props.aspectRatioList[aspectRatioActive.value];
        (<any>state.cropper) = new Cropper(cropperImgRef.value, {
          viewMode: 1,
          dragMode: "none",
          aspectRatio: item.width / item.height,
          background: true,
          autoCropArea: 1,
          zoomOnWheel: false,
          minCropBoxHeight: 100,
        });
      }
    }

    //修改比例
    function switchActive(index: number) {
      if (aspectRatioActive.value === index) return;
      aspectRatioActive.value = index;
      const item = props.aspectRatioList[aspectRatioActive.value];
      (<any>state.cropper).setAspectRatio(item.width / item.height);
    }
    return {
      openDialog,
      cropperEnd,
      switchActive,
      upCropperImg,
      cropperImgRef,
      aspectRatioActive,
      isShowDialog,
      closeDialog,
      ...toRefs(props),
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.cropper-warp {
  display: flex;
  height: 50vh;

  .cropper-warp-left {
    position: relative;
    display: inline-block;
    flex: 1;
    border: 1px solid var(--el-border-color);
    background: var(--el-color-white);
    overflow: hidden;
    background-repeat: no-repeat;
    cursor: move;
    border-radius: var(--el-border-radius-base);

    .cropper-warp-left-img {
      width: 100%;
      height: 100%;
    }
  }

  .cropper-warp-right {
    width: 150px;
    height: 350px;

    .cropper-warp-right-title {
      text-align: center;
      height: 20px;
      line-height: 20px;
    }

    .cropper-warp-right-item {
      margin: 15px 0;

      .cropper-warp-right-value {
        display: flex;

        .cropper-warp-right-value-img {
          width: 100px;
          height: 100px;
          margin: auto;
        }

        .cropper-size {
          width: 50px;
          height: 50px;
        }
      }

      .cropper-warp-right-label {
        text-align: center;
        font-size: 12px;
        color: var(--el-text-color-primary);
        height: 30px;
        line-height: 30px;
      }
    }
  }
}
</style>
