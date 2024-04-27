export interface getMenuListItem {
  delete_time: string;
  id: string;
  menu_type: "0" | "1";
  name: string;
  order: string;
  parent: string;
  route: string;
}
export interface getMenuList extends getMenuListItem {
  children: getMenuList[];
}
export interface getProviderMenuResultInterface {
  total: number;
  data: getMenuList[];
}

export interface postCreateAuthRoleDataInterface {
  "ProviderAuthRole[role_name]": string;
  "ProviderAuthRole[role_auth_ids]": string;
}

export interface postUpdateAuthRoleDataInterface
  extends postCreateAuthRoleDataInterface {
  id: string;
}

export interface getSaveProviderRoleDataInterface {
  roleIds: string;
  subProviderId: string;
}

export interface getProviderRoleResultInterface {
  id: number;
  role_name: string;
}
