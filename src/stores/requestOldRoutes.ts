import { defineStore } from "pinia";

/**
 * 后端返回原始路由(未处理时)
 * @methods setCacheKeepAlive 设置接口原始路由数据
 */
export const useRequestOldRoutes = defineStore("requestOldRoutes", {
  state: (): RequestOldRoutesState => ({
    requestOldRoutes: [],
  }),
  actions: {
    setRequestOldRoutes(routes: Array<string>) {
      this.requestOldRoutes = routes;
      return Promise.resolve();
    },
  },
});
