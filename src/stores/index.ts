// https://pinia.vuejs.org/
import { createPinia } from "pinia";
import $persistedstate from "pinia-plugin-persistedstate";
// 创建
const pinia = createPinia();
pinia.use($persistedstate);
// 导出
export default pinia;
