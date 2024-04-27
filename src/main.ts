import '@/theme/tailwind.css';
import '@/theme/index.scss';
import '@/utils/aliyun-upload-sdk/lib/aliyun-oss-sdk-6.17.1.min.js';
import '@/utils/aliyun-upload-sdk/aliyun-upload-sdk-1.5.5.min.js';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

import { createApp } from 'vue';
// import ElementPlus from "element-plus";
import VueGridLayout from 'vue-grid-layout';

import App from '@/App.vue';
import { directive } from '@/directive';
import { i18n } from '@/i18n';
import router from '@/router';
import pinia from '@/stores/index';
import other from '@/utils/other';
// import { ElementPlus } from "@element-plus/icons-vue";
const app = createApp(App);

directive(app);
other.elSvg(app);
const meta = document.createElement('meta');
meta.name = 'naive-ui-style';
document.head.appendChild(meta);

app
  .use(pinia)
  .use(router)
  // .use(ElementPlus)
  .use(i18n)
  .use(VueGridLayout)
  .mount('#app');
