<script name="noPower" setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import $mittBus from '@/utils/mitt';

const $route = useRoute();
const $router = useRouter();

defineProps<{
  type?: 'api-no-power';
}>();

function back() {
  $mittBus.emit('onCloseCurrentTagsViewClick', {
    route: $route,
    callback: () => {
      if ($router.options.history.state?.back) {
        $router.back();
      } else {
        $router.replace({ path: '/' });
      }
    },
    errorCallback: () => {
      if ($router.options.history.state?.back) {
        $router.back();
      } else {
        $router.replace({ path: '/' });
      }
    },
  });
}

function loadPage() {
  $mittBus.emit('onRefreshCurrentTagsView', $route);
}
</script>
<template>
  <div class="error layout-padding">
    <div class="layout-padding-auto layout-padding-view">
      <div class="error-flex">
        <div class="left">
          <div class="left-item">
            <div class="left-item-animation-0 left-item-num">401</div>
            <div class="left-item-animation-1 left-item-title">
              {{ $t('message.noAccess.accessTitle') }}
            </div>
            <div class="left-item-animation-2">
              <slot>
                <n-space class="mt-4">
                  <n-button v-if="type === 'api-no-power'" @click="loadPage"> 重新加载 </n-button>
                  <n-button type="primary" @click="back"> 返回上一页 </n-button>
                </n-space>
              </slot>
            </div>
          </div>
        </div>
        <!--				<div class="right">-->
        <!--					<img src="https://i.hd-r.cn/2cf0d2e192660eec23eb9d0655753e7d.png" />-->
        <!--				</div>-->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error {
  width: 100%;
  height: 100%;
  .error-flex {
    margin: auto;
    display: flex;
    height: 350px;
    width: 900px;
    .left {
      flex: 1;
      height: 100%;
      align-items: center;
      display: flex;
      .left-item {
        .left-item-num {
          color: var(--el-color-info);
          font-size: 55px;
        }
        .left-item-title {
          font-size: 20px;
          color: var(--el-text-color-primary);
          margin: 15px 0 5px 0;
        }
        .left-item-msg {
          color: var(--el-text-color-secondary);
          font-size: 12px;
          margin-bottom: 30px;
          animation-delay: 0.2s;
        }
      }
    }
    .right {
      flex: 1;
      opacity: 0;
      animation-name: error-img;
      animation-duration: 2s;
      animation-fill-mode: forwards;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}

@for $i from 0 through 5 {
  .left-item-animation-#{$i} {
    opacity: 0;
    animation-name: error-num;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
    animation-delay: calc($i * 100) + ms;
  }
}
</style>
