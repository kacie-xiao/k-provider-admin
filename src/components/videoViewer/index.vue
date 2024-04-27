<template>
  <div class="el-image-viewer__wrapper" style="z-index: 2512">
    <div class="el-image-viewer__mask" @click="close"></div>
    <span class="el-image-viewer__btn el-image-viewer__close" @click="close">
      <svg-icon name="ele-Close"></svg-icon>
    </span>
    <div class="el-image-viewer__canvas">
      <transition name="fade">
        <video v-show="show" :src="src" class="el-image-viewer__img" controls muted @loadeddata="loadeddata"></video>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

import SvgIcon from '@/components/svgIcon/index.vue';

export default defineComponent({
  name: 'VideoViewer',
  components: { SvgIcon },
  props: {
    // 视频路径
    src: {
      type: String,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    function close() {
      emit('close');
    }

    const show = ref(false);

    function loadeddata() {
      show.value = true;
    }

    return {
      close,
      loadeddata,
      show,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
.el-image-viewer__img {
  z-index: 1;
  height: 75vh;
}

.fade-enter-active,
.fade-leave-active {
  transform: scale(1, 1);
  opacity: 1;
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0, 0);
}
</style>
