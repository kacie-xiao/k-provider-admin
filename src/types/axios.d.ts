/**
 * 分页长列表
 */
declare interface globalLongListType<T> {
  code: number;
  total: number;
  data: T;
}

/**
 * 一般返回
 */
declare interface globalResultType<T> {
  code: number;
  data: T;
}

/**
 * 分页配置
 */
declare interface globalPageConfigType {
  page: number; //当前页码
  "per-page": number; //每页数量
}

/**
 * 更新时返回
 */
declare interface globalUpdateType<T> {
  code: number;
  msg: string;
  data: T;
}
