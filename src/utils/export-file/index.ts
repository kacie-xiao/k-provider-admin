import type { AxiosInstance } from "axios";
import axios from "axios";
import { Session } from "@/utils/storage";
import qs from "qs";
import { productListParamsInterface } from "@/api/product/product-list";
import {
  commissionServiceListParamsInterface,
  getSettlesListParamsInterface,
} from "@/api/settle/settle-list";
import { $createMessage } from "@/utils/hooks";
import { getDepositListParamsInterface } from "@/api/deposit/deposit-list";
import { error } from "echarts/types/src/util/log";
import { resolve } from "path";

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 50000,
  headers: { "Content-Type": "application/json" },
  responseType: "blob",
  paramsSerializer: {
    serialize(params) {
      return qs.stringify(params, { allowDots: true });
    },
  },
});

// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么 token
    const token = Session.get("token");
    if (token) {
      (<any>config.headers)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    const res: Blob = response.data;
    return new Promise<any>((resolve, reject) => {
      if (res.type === "application/json") {
        const reader = new FileReader();
        reader.readAsText(res, "utf-8");
        reader.onload = (ev) => {
          const str = ev.target?.result;
          if (typeof str === "string") {
            const { code, msg } = JSON.parse(str);
            if (code === 41001) {
              $createMessage.error(msg);
            }
          }
          reader.onload = null;
        };
        reject();
      } else {
        resolve(res);
      } // 对响应数据做点什么
    });
  },
  (error) => {
    // 对响应错误做点什么
    if (error.message.indexOf("timeout") != -1) {
      $createMessage.error("网络超时");
      return Promise.reject("网络超时");
    } else if (error.message == "Network Error") {
      $createMessage.error("网络连接错误");
      return Promise.reject("网络连接错误");
    } else {
      return Promise.reject(error);
    }
  },
);

enum Api {
  exportProductList = "/v1/providers/product/list_export", //导出产品列表
  exportSettlesList = "/v1/providers/provider_settle/settles_list_export", //导出订单账单
  exportServiceList = "/v1/providers/commission/service_list_export", //导出技术服务费
  exportDepositList = "/v1/providers/deposit/list_export", //导出保证金账单列表
  exportDeliveryList = "/v1/providers/order/delivery_list_export", //导出待发货列表
}

/**
 * 导出产品列表
 */
export function exportProductList(
  params: productListParamsInterface,
): Promise<Blob> {
  return service.get(Api.exportProductList, { params });
}

/**
 * 导出订单账单
 */
export function exportSettlesList(
  params: getSettlesListParamsInterface,
): Promise<Blob> {
  return service.get(Api.exportSettlesList, { params });
}

/**
 * 导出技术服务费
 */
export function exportServiceList(
  params: commissionServiceListParamsInterface,
): Promise<Blob> {
  return service.get(Api.exportServiceList, { params });
}

/**
 * 导出保证金账单列表
 */
export function exportDepositList(
  params: getDepositListParamsInterface,
): Promise<Blob> {
  return service.get(Api.exportDepositList, { params });
}

/**
 * 导出待发货列表
 */
export function exportDeliveryList(
  params: getDepositListParamsInterface,
): Promise<Blob> {
  return service.get(Api.exportDeliveryList, { params });
}
