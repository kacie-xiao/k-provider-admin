export interface defaultRouteListInterface {
  path: string;
  name: string;
  component: string;
  redirect?: string;
  meta: {
    title: string;
    isLink: string;
    isHide: boolean;
    isKeepAlive: boolean;
    isAffix: boolean;
    isIframe: boolean;
    roles?: string[];
    icon: string;
    isTest?: boolean;
    isNoTagsView?: boolean;
  };
  children?: defaultRouteListInterface[];
}

export const defaultRouteList: defaultRouteListInterface[] = [
  {
    path: '/systemManagement',
    name: 'systemManagement',
    component: 'layout/routerView/parent',
    meta: {
      title: 'message.router.systemManagement',
      isLink: '',
      isHide: false,
      isKeepAlive: true,
      isAffix: false,
      isIframe: false,
      roles: ['admin', 'common'],
      icon: 'iconfont icon-shouye',
    },
    redirect: '/systemManagement/administratorList',
    children: [
      {
        path: '/systemManagement/administratorList',
        name: 'administratorList',
        component: 'systemManagement/administratorList/index',
        meta: {
          title: 'message.router.administratorList',
          isLink: '',
          isHide: false,
          isKeepAlive: true,
          isAffix: true,
          isIframe: false,
          roles: ['admin', 'common'],
          icon: 'iconfont icon-caidan',
        },
      },
      {
        path: '/systemManagement/menuManagement',
        name: 'menuManagement',
        component: 'systemManagement/menuManagement/index',
        meta: {
          title: 'message.router.menuManagement',
          isLink: '',
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ['admin', 'common'],
          icon: 'iconfont icon-caidan',
        },
      },
      {
        path: '/systemManagement/roleManagement',
        name: 'roleManagement',
        component: 'systemManagement/roleManagement/index',
        meta: {
          title: 'message.router.roleManagement',
          isLink: '',
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ['admin', 'common'],
          icon: 'iconfont icon-caidan',
        },
      },
    ],
  },
];
export const defaultRoute: defaultRouteListInterface[] = [
  {
    path: '/error',
    name: 'error',
    component: 'layout/routerView/parent',
    meta: {
      title: '错误',
      isLink: '',
      isHide: true,
      isKeepAlive: false,
      isAffix: false,
      isIframe: false,
      roles: ['admin', 'common'],
      icon: '',
    },
    children: [
      {
        path: '/error/401',
        name: 'error-401',
        component: 'error/401',
        meta: {
          title: '无权限',
          isLink: '',
          isHide: true,
          isKeepAlive: false,
          isAffix: false,
          isIframe: false,
          roles: ['admin', 'common'],
          icon: '',
        },
      },
    ],
  },
];
