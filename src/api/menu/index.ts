import { defaultRoute, defaultRouteList } from "@/api/menu/allMenu";
import {
  getMenuList,
  getMenuListItem,
} from "@/api/menu/types";
import { deepClone } from "@/utils";

enum Api {

}

/**
 * 以下为模拟接口地址，gitee 的不通，就换自己的真实接口地址
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 * 后端控制菜单模拟json，路径在 https://gitee.com/lyt-top/vue-next-admin-images/tree/master/menu
 * 后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
 * @method getMenu 获取后端动态路由菜单(admin)
 */
export function useMenuApi() {
  return {
    getMenu: () => {
      return new Promise<any[]>((resolve, reject) => {
        // getProviderMenu()
        //   .then((res) => {
        //     const rows = filterProviderMenu(res.data.data);
        //     if (rows.length) {
        //       resolve(rows.concat(defaultRoute));
        //     } else {
        //       reject();
        //     }
        //   })
        //   .catch(() => {
        //     reject();
        //   });
        resolve([...defaultRouteList,...defaultRoute]);
      });
    },
  };
}

export function filterProviderMenu(rows: getMenuList[]) {
  const filterRows: getMenuListItem[] = [];
  function addRows(params: getMenuList[]) {
    params.forEach((item) => {
      if (item.menu_type === "0") {
        filterRows.push(item);
      }
      if (item.children && item.children.length) {
        addRows(item.children);
      }
    });
  }
  addRows(rows);

  function addResult(params: any[]) {
    return params.filter((item) => {
      const index = filterRows.findIndex((el) => el.route === item.name);
      if (index >= 0) {
        if (item.children && item.children.length) {
          const children = addResult(item.children);
          item.children = children.length ? children : undefined;
        }
        item.meta.title = filterRows[index].name;
        item.id = filterRows[index].id;
      }
      return index >= 0 || item.meta.isHide || item.meta.isTest;
    });
  }
  const defaultRouteListCopy = deepClone(defaultRouteList);
  return addResult(defaultRouteListCopy);
}
