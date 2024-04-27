/**
 * @function useDebounce 防抖函数
 */
export function useDebounce() {
  let DebounceTimer: NodeJS.Timeout | null = null;
  return (callback: Function, time: number = 300) => {
    if (DebounceTimer) {
      clearTimeout(DebounceTimer);
      DebounceTimer = null;
    }
    DebounceTimer = setTimeout(() => {
      callback();
      DebounceTimer = null;
    }, time);
  };
}

/**
 * 下划线转驼峰
 */
export function toCamel(str: string) {
  return str.replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => {
    return $1 + $2.toUpperCase();
  });
}

/**
 * 深度克隆
 **/
export function deepClone(value: any, weakMap = new WeakMap()) {
  const is = {
    Array: Array.isArray,
    Date: (val: any) => val instanceof Date,
    Set: (val: any) => Object.prototype.toString.call(val) === "[object Set]",
    Map: (val: any) => Object.prototype.toString.call(val) === "[object Map]",
    Object: (val: any) =>
      Object.prototype.toString.call(val) === "[object Object]",
    Symbol: (val: any) =>
      Object.prototype.toString.call(val) === "[object Symbol]",
    Function: (val: any) =>
      Object.prototype.toString.call(val) === "[object Function]",
  };

  // 2.1 函数浅拷贝
  /* if (is.Function(value)) return value */

  // 2.2 函数深拷贝
  if (is.Function(value)) {
    if (/^function/.test(value.toString()) || /^\(\)/.test(value.toString()))
      return new Function("return " + value.toString())();

    return new Function("return function " + value.toString())();
  }

  // 3.Date 深拷贝
  if (is.Date(value)) return new Date(value.valueOf());

  // 4.判断如果是Symbol的value, 那么创建一个新的Symbol
  if (is.Symbol(value)) return Symbol(value.description);

  // 5.判断是否是Set类型 进行深拷贝
  if (is.Set(value)) {
    // 5.1 浅拷贝 直接进行解构即可
    // return new Set([...value])

    // 5.2 深拷贝
    const newSet = new Set();
    for (const item of value) {
      // @ts-ignore
      newSet.add(deepClone(item), weakMap);
    }
    return newSet;
  }

  // 6.判断是否是Map类型
  if (is.Map(value)) {
    // 6.1 浅拷贝 直接进行解构即可
    // return new Map([...value])

    // 6.2 深拷贝
    const newMap = new Map();
    for (const item of value)
      newMap.set(deepClone(item[0], weakMap), deepClone(item[1], weakMap));
    return newMap;
  }

  // 9.判断weakMap是否有值 有值的情况下就直接将值返回就可以
  if (weakMap.has(value)) return weakMap.get(value);

  // 11.2 判断数组
  if (is.Array(value)) {
    const newArr: any[] = [];
    for (const item in value) newArr[item] = deepClone(value[item], weakMap);
    return newArr;
  }

  // 1.如果不是对象类型则直接将当前值返回
  if (!is.Object(value)) return value;

  // 7.判断传入的对象是数组, 还是对象
  const newObj = is.Array(value) ? [] : {};

  // 10.当weakMap没有值时，将originValue作为key, newObj作为value
  weakMap.set(value, newObj);

  for (const key in value) {
    // 11.1 判断数组
    if (is.Array(value[key])) deepClone(value[key], weakMap);

    weakMap.set(value, newObj);
    // 8 进行递归调用
    // @ts-ignore
    newObj[key] = deepClone(value[key], weakMap);
  }

  // 4.1 对Symbol作为key进行特殊的处理 拿到对象上面的所有Symbol key，以数组形式返回
  const symbolKeys = Object.getOwnPropertySymbols(value);
  for (const sKey of symbolKeys) {
    // 4.2 这里没有必要创建一个新的Symbol
    // const newSKey = Symbol(sKey.description)

    // 4.3 直接将原来的Symbol key 拷贝到新对象上就可以了
    // @ts-ignore
    newObj[sKey] = deepClone(value[sKey], weakMap);
  }
  return newObj;
}

/**
 * 复制到剪切板
 */
export function setCopy(str: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(str);
  } else {
    // 创建一个输入框元素
    const inputElement = document.createElement("textarea");
    // 更新input的value
    inputElement.value = str;
    inputElement.readOnly = true;
    // 随便找个父级容器 建议找一个层级较深的DOM元素，避免过多的重绘
    const dom = document.querySelector("body");
    // 将创建的input添加到容器中
    dom && dom.appendChild(inputElement);
    // 使用select方法将值选中
    inputElement.select();
    // 调用copy方法复制内容
    const flag = document.execCommand("copy", true);
    // 删除生成的input元素
    inputElement.remove();
    // 根据返回值判断是否返回成功
    return flag ? Promise.resolve() : Promise.reject();
  }
}

/**
 * 更新对象数组某一个值
 * @param obj
 * @param key
 * @param value
 * @param {number} idx
 */
export function updateObjValue(
  obj: any,
  key: (string | number)[],
  value: any,
  idx: number = 0,
) {
  if (idx >= key.length - 1) {
    obj[key[idx]] = value;
  } else {
    updateObjValue(obj[key[idx]], key, value, idx + 1);
  }
}

/**
 * 双向绑定处理 默认去除前后空格
 */
export function updateValueFormat(
  value: string,
  callback?: (value: string) => string,
) {
  if (callback) {
    return callback(value);
  }
  return value ? value.trim() : "";
}

/**
 * 两个数生成数组
 * @param start
 * @param end
 */
export function rangeArray(start: number, end: number): number[] {
  return Array(end - start + 1)
    .fill(undefined)
    .map((_, idx) => start + idx);
}
