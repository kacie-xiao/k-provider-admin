import axios, { AxiosInstance } from 'axios';
import { Session } from '@/utils/storage';
import qs from 'qs';
import { $createMessage } from '@/utils/hooks';
import router from '@/router';

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
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
    const token = Session.get('token');
    const temporaryToken = Session.get('temporary-token');
    if (token || temporaryToken) {
      (<any>config.headers)['Authorization'] = `Bearer ${token || temporaryToken}`;
    }
    if ((<any>config.headers)['Content-Type'] === 'application/x-www-form-urlencoded') {
      config.data = qs.stringify(config.data);
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
    // 对响应数据做点什么
    const res = response.data;
    if (res.code === 200) {
      if (res.msg) {
        $createMessage.success(res.msg);
      }
      return res;
    } else if (res.code === 400) {
      if (res.msg) {
        $createMessage.error(res.msg, { duration: 2000, closable: true });
      }
      return Promise.reject(res);
    } else if (res.code === 20010) {
      if (res.msg) {
        $createMessage.error(res.msg);
      }
      Session.clear();
      window.location.reload();
      return Promise.reject(res);
    } else if (res.code === 41001) {
      if (res.msg) {
        $createMessage.error(res.msg);
      }
      return Promise.reject(res);
    } else if (res.code === 20006) {
      if (res.msg) {
        $createMessage.error(res.msg);
      }
      return Promise.reject(res);
    } else if (res.code === 200013) {
      if (res.msg) {
        $createMessage.error(res.msg);
      }
      return Promise.reject(res);
    } else if (res.code === 86004) {
      if (res.msg) {
        $createMessage.error(res.msg);
      }
      return Promise.reject(res);
    } else {
      return Promise.reject(res);
    }
  },
  (error) => {
    // 对响应错误做点什么
    if (error.message.indexOf('timeout') != -1) {
      $createMessage.error('网络超时');
      return Promise.reject('网络超时');
    } else if (error.message == 'Network Error') {
      $createMessage.error('网络连接错误');
      return Promise.reject('网络连接错误');
    } else {
      if (error.response) {
        if (error.response.status === 401) {
          $createMessage.error('你已被登出，请重新登录');
          Session.clear(); // 清除浏览器全部临时缓存
          window.location.reload(); // 去登录页
          return Promise.reject('请重新登录');
        } else {
          if (error.response.message) {
            $createMessage.error(error.response.message);
          }
          return Promise.reject(error.response.data);
        }
      } else {
        $createMessage.error('接口路径找不到');
      }
    }
    return Promise.reject(error);
  },
);

// 导出 axios 实例
export default service;

