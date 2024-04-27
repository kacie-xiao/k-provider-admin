import Cookies from "js-cookie";

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
  // 查看 v2.4.3版本更新日志
  setKey(key: string) {
    // @ts-ignore
    return `${__NEXT_NAME__}:${key}`;
  },
  // 设置永久缓存
  set<T>(key: string, val: T) {
    window.localStorage.setItem(Local.setKey(key), JSON.stringify(val));
  },
  // 获取永久缓存
  get(key: string) {
    let json = <string>window.localStorage.getItem(Local.setKey(key));
    return JSON.parse(json);
  },
  // 移除永久缓存
  remove(key: string) {
    window.localStorage.removeItem(Local.setKey(key));
  },
  // 移除全部永久缓存
  clear() {
    window.localStorage.clear();
  },
};

type keyType = string | "token" | "temporary-token" | "userName";
/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
  // 设置临时缓存
  set<T>(key: keyType, val: T) {
    if (key === "token") return Cookies.set(key, JSON.stringify(val));
    if (key === "temporary-token") return Cookies.set(key, JSON.stringify(val));
    if (key === "userName") return Cookies.set(key, JSON.stringify(val));
    window.sessionStorage.setItem(Local.setKey(key), JSON.stringify(val));
  },
  // 获取临时缓存
  get(key: keyType) {
    if (key === "token") {
      const value = Cookies.get(key);
      return value ? JSON.parse(value) : undefined;
    }
    if (key === "temporary-token") {
      const value = Cookies.get(key);
      return value ? JSON.parse(value) : undefined;
    }
    if (key === "userName") {
      const value = Cookies.get(key);
      return value ? JSON.parse(value) : undefined;
    }
    let json = <string>window.sessionStorage.getItem(Local.setKey(key));
    return JSON.parse(json);
  },
  // 移除临时缓存
  remove(key: keyType) {
    if (key === "token") return Cookies.remove(key);
    if (key === "temporary-token") return Cookies.remove(key);
    if (key === "userName") return Cookies.remove(key);
    window.sessionStorage.removeItem(Local.setKey(key));
  },
  // 移除全部临时缓存
  clear() {
    Cookies.remove("token");
    Cookies.remove("temporary-token");
    Cookies.remove("userName");
    window.sessionStorage.clear();
  },
};
