import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import pinia from "@/stores/index";
import { storeToRefs } from "pinia";
import { useKeepALiveNames } from "@/stores/keepAliveNames";
import { useRoutesList } from "@/stores/routesList";
import { Session } from "@/utils/storage";
import { staticRoutes, notFoundAndNoPower } from "@/router/route";
import { initBackEndControlRoutes } from "@/router/backEnd";
import { NextLoading } from "@/utils/loading";
import { $createMessage } from "@/utils/hooks";
import {
  defaultRouteList,
  defaultRouteListInterface,
} from "@/api/menu/allMenu";

/**
 * 1、前端控制路由时：isRequestRoutes 为 false，需要写 roles，需要走 setFilterRoute 方法。
 * 2、后端控制路由时：isRequestRoutes 为 true，不需要写 roles，不需要走 setFilterRoute 方法），
 * 相关方法已拆解到对应的 `backEnd.ts` 与 `frontEnd.ts`（他们互不影响，不需要同时改 2 个文件）。
 * 特别说明：
 * 1、前端控制：路由菜单由前端去写（无菜单管理界面，有角色管理界面），角色管理中有 roles 属性，需返回到 userInfo 中。
 * 2、后端控制：路由菜单由后端返回（有菜单管理界面、有角色管理界面）
 */

/**
 * 创建一个可以被 Vue 应用程序使用的路由实例
 * @method createRouter(options:RouterOptions): Router
 * @link 参考：https://next.router.vuejs.org/zh/api/#createrouter
 */
export const router = createRouter({
  history: createWebHistory(),
  /**
   * 说明：
   * 1、notFoundAndNoPower 默认添加 404、401 界面，防止一直提示 No match found for location with path 'xxx'
   * 2、backEnd.ts(后端控制路由)、frontEnd.ts(前端控制路由) 中也需要加 notFoundAndNoPower 404、401 界面。
   *    防止 404、401 不在 layout 布局中，不设置的话，404、401 界面将全屏显示
   */
  routes: [...notFoundAndNoPower, ...staticRoutes],
});

/**
 * 路由多级嵌套数组处理成一维数组
 * @param arr 传入路由菜单数据数组
 * @returns 返回处理后的一维路由菜单数组
 */
export function formatFlatteningRoutes(arr: any) {
  if (arr.length <= 0) return false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children) {
      arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
    }
  }
  return arr;
}

/**
 * 一维数组处理成多级嵌套数组（只保留二级：也就是二级以上全部处理成只有二级，keep-alive 支持二级缓存）
 * @description isKeepAlive 处理 `name` 值，进行缓存。顶级关闭，全部不缓存
 * @link 参考：https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成 `定义动态路由（dynamicRoutes）` 的格式
 */
export function formatTwoStageRoutes(arr: any) {
  if (arr.length <= 0) return false;
  const newArr: any = [];
  const cacheList: Array<string> = [];
  arr.forEach((v: any) => {
    if (v.path === "/") {
      newArr.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: [],
      });
    } else {
      // 判断是否是动态路由（xx/:id/:name），用于 tagsView 等中使用
      // 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
      if (v.path.indexOf("/:") > -1) {
        v.meta["isDynamic"] = true;
        v.meta["isDynamicPath"] = v.path;
      }
      newArr[0].children.push({ ...v });
      // 存 name 值，keep-alive 中 include 使用，实现路由的缓存
      // 路径：@/layout/routerView/parent.vue
      if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive) {
        cacheList.push(v.name);
        const stores = useKeepALiveNames(pinia);
        stores.setCacheKeepAlive(cacheList);
      }
    }
  });
  return newArr;
}

const noRuleRouter = ["/register-info", "/register-status", "/submit-info"];
const noTokenRouter = [
  "/start/login",
  "/start/forgotPassword",
  "/start/bindMobilePhone",
  "/start/register",
  "/system-desc",
];

/**
 * 判断是否存在与默认路由
 */
function hasDefaultRouteList(
  routeList: defaultRouteListInterface[],
  path: string,
): boolean {
  let result: boolean = false;
  const length = routeList.length;
  for (let idx = 0; idx < length; idx++) {
    const item = routeList[idx];
    const isPath = item.path === path;
    const isChildrenPath =
      item.children && item.children.length
        ? hasDefaultRouteList(item.children, path)
        : false;
    result = isPath || isChildrenPath;
    if (result) {
      break;
    }
  }
  return result;
}
// 路由加载前
router.beforeEach(async (to, from, next) => {
  Session.set("token",'123456')
  NProgress.configure({ showSpinner: false });
  if (to.meta.title) NProgress.start();
  const token = Session.get("token");
  const temporaryToken = Session.get("temporary-token");
  const storesRoutesList = useRoutesList(pinia);
  const { routesList } = storeToRefs(storesRoutesList);
  if (token) {
    if (to.path === "/start/login") {
      next({ path: "/", replace: true });
    } else {
      if (routesList.value.length === 0) {
        try {
          // 后端控制路由：路由数据初始化，防止刷新时丢失
          await initBackEndControlRoutes();
          next({ path: to.path, query: to.query, replace: true });
          // 解决刷新时，一直跳 404 页面问题，关联问题 No match found for location with path 'xxx'
          // to.query 防止页面刷新时，普通路由带参数时，参数丢失。动态路由（xxx/:id/:name"）isDynamic 无需处理
        } catch (err) {
          $createMessage.error("账号暂未分配权限");
          Session.clear();
          next({ path: "/start/login", replace: true });
        }
      } else {
        if (
          hasDefaultRouteList(defaultRouteList, to.path) &&
          !hasDefaultRouteList(routesList.value, to.path)
        ) {
          next({ path: "/error/401" });
        } else {
          next();
        }
      }
    }
  } else {
    if (temporaryToken) {
      if (noRuleRouter.includes(to.path) || noTokenRouter.includes(to.path)) {
        next();
      } else {
        next("/start/login");
      }
    } else {
      if (noTokenRouter.includes(to.path)) {
        next();
      } else {
        if (noRuleRouter.includes(to.path)) {
          next(
            `/start/login?redirect=${to.path}&params=${JSON.stringify(
              to.query ? to.query : to.params,
            )}`,
          );
        } else {
          next({ path: "/start/login" });
        }
      }
    }
  }

  // if (noTokenRouter.includes(to.path) && !token) {
  //   next();
  //   NProgress.done();
  // } else {
  //   const storesRoutesList = useRoutesList(pinia);
  //   const { routesList } = storeToRefs(storesRoutesList);
  //   if (!token) {
  //     next(
  //       `/start/login?redirect=${to.path}&params=${JSON.stringify(
  //         to.query ? to.query : to.params
  //       )}`
  //     );
  //     NProgress.done();
  //   } else if (token && to.path === "/start/login") {
  //     console.log(routesList.value);
  //     // if (filterRoutes(routesList.value).length) {
  //     //   next("/home");
  //     // } else {
  //     next();
  //     //}
  //     NProgress.done();
  //   } else {
  //     if (noRuleRouter.includes(to.path)) return next();
  //     if (routesList.value.length === 0) {
  //       // 后端控制路由：路由数据初始化，防止刷新时丢失
  //       await initBackEndControlRoutes();
  //       // 解决刷新时，一直跳 404 页面问题，关联问题 No match found for location with path 'xxx'
  //       // to.query 防止页面刷新时，普通路由带参数时，参数丢失。动态路由（xxx/:id/:name"）isDynamic 无需处理
  //       next({ path: to.path, query: to.query });
  //     } else {
  //       next();
  //     }
  //   }
  //}
});
// 路由加载后
router.afterEach(() => {
  NProgress.done();
  NextLoading.done();
});

// 导出路由
export default router;
