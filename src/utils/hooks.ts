import {
  computed,
  onBeforeMount,
  onUnmounted,
  reactive,
  ref,
  Ref,
  watch,
  nextTick,
  Directive,
} from "vue";
import type { WatchStopHandle } from "vue";
import { deepClone } from "@/utils/index";
import { DataTableSortState, createDiscreteApi } from "naive-ui";
import $router from "@/router";

const { message: $createMessage, dialog: $createDialog } = createDiscreteApi([
  "message",
  "dialog",
]);

export { $createMessage, $createDialog };

export const vSystemDesc: Directive<HTMLElement, {key: string, terrace?: string;}> = {
  mounted: (el, binding) => {
    el.onclick = () => {
      const { href } = $router.resolve({
        name: "system-desc",
        query: binding.value,
      });
      window.open(href, "_blank");
    };
  },
  beforeUnmount: (el) => {
    el.onclick = null;
  },
};
/**
 * 倒计时
 * @param duration
 * @returns
 */
export const useCounter = (
  duration = 60
): [Ref<number>, () => void, () => void] => {
  let intervalTimer: NodeJS.Timeout;
  onUnmounted(() => {
    clearInterval(intervalTimer);
  });
  const countDown = ref(0);

  return [
    countDown,
    () => {
      countDown.value = duration;
      intervalTimer = setInterval(() => {
        if (countDown.value > 0) {
          countDown.value -= 1;
        } else {
          clearInterval(intervalTimer);
          countDown.value = 0;
        }
      }, 1000);
    },
    () => {
      clearInterval(intervalTimer);
      countDown.value = 0;
    },
  ];
};

interface useTableListInterface<T = any> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  hasLoading: boolean;
  hasSearch: boolean;
  sort: string;
}

interface useTableListParamsInterface {
  load_list_fun: Function;
  default_page_size?: number;
  default_sort?: string;
}

interface watchConfigInterface {
  searchConfig?: WatchStopHandle;
  page?: WatchStopHandle;
  pageSize?: WatchStopHandle;
}
export function useTableList<T, searchType extends object>(
  search: searchType,
  options: useTableListParamsInterface
) {
  const tableListConfig = reactive<useTableListInterface<T>>({
    list: [],
    page: 1,
    pageSize: options.default_page_size ?? 10,
    total: 0,
    hasLoading: false,
    hasSearch: false,
    sort: options.default_sort ?? "",
  });

  const totalPage = computed(() => {
    return Math.ceil(tableListConfig.total / tableListConfig.pageSize);
  });

  const defaultSearch: searchType = deepClone(search);
  const searchKeys: Array<keyof searchType> = Object.keys(
    defaultSearch
  ) as Array<keyof searchType>;

  const searchConfig = reactive<searchType>(deepClone(search));

  /**
   * 搜索项是否改变
   */
  function hasSearchChange() {
    // @ts-ignore
    return searchKeys.some((el) => defaultSearch[el] !== searchConfig[el]);
  }

  /**
   * 回到页码
   */
  function resetPage(autoLoad: boolean = true) {
    if (tableListConfig.page > 1) {
      tableListConfig.page = 1;
    } else {
      autoLoad && options.load_list_fun();
    }
  }

  /**
   * 搜索表单
   */
  function submitSearch(bol?: boolean) {
    if (hasSearchChange() || bol === true) {
      tableListConfig.hasSearch = true;
      resetPage();
    } else {
      $createMessage.warning("请输入搜索条件");
    }
  }

  /**
   * 重置搜索表单
   */
  function resetSearch() {
    if (hasSearchChange()) {
      searchKeys.forEach((el) => {
        // @ts-ignore
        searchConfig[el] = defaultSearch[el];
      });
      if (tableListConfig.hasSearch) {
        tableListConfig.hasSearch = false;
        nextTick(() => {
          resetPage();
        });
        return Promise.resolve();
      } else {
        return Promise.reject();
      }
    } else {
      return Promise.reject();
    }
  }

  /**
   * 清除数据
   */
  function resetTableList() {
    tableListConfig.list = [];
    tableListConfig.total = 0;
  }

  /**
   * 排序更新函数
   * @param prop
   * @param order
   */
  function sortChange({ prop, order }: globalSortChangeType) {
    if (prop && order) {
      if (order === "ascending") {
        tableListConfig.sort = prop;
      } else {
        tableListConfig.sort = `-${prop}`;
      }
    } else {
      tableListConfig.sort = "";
    }
    options.load_list_fun();
  }

  function sorterChange(config: DataTableSortState) {
    if (config.order) {
      if (config.order === "ascend") {
        tableListConfig.sort = config.columnKey as string;
      } else {
        tableListConfig.sort = ("-" + config.columnKey) as string;
      }
    } else {
      tableListConfig.sort = "";
    }
    options.load_list_fun();
  }

  const watchConfig: watchConfigInterface = {
    searchConfig: undefined,
    page: undefined,
    pageSize: undefined,
  };

  /**
   * 开始监听
   */
  function onWatch() {
    watchConfig.page ||
      (watchConfig.page = watch(
        () => tableListConfig.page,
        () => {
          options.load_list_fun();
        }
      ));

    watchConfig.pageSize ||
      (watchConfig.pageSize = watch(
        () => tableListConfig.pageSize,
        () => {
          resetPage();
        }
      ));

    watchConfig.searchConfig ||
      (watchConfig.searchConfig = watch(searchConfig, () => {
        if (!hasSearchChange() && tableListConfig.hasSearch) {
          tableListConfig.hasSearch = false;
          resetPage();
        }
      }));
  }

  /**
   * 取消某个或者所有监听
   * @param key
   */
  function offWatch(key?: keyof watchConfigInterface) {
    if (key) {
      // @ts-ignore
      watchConfig[key] && watchConfig[key]();
      watchConfig[key] = undefined;
    } else {
      for (let key in watchConfig) {
        //@ts-ignore
        if (watchConfig[key]) {
          //@ts-ignore
          watchConfig[key]();
          //@ts-ignore
          watchConfig[key] = undefined;
        }
      }
    }
  }

  onBeforeMount(() => {
    onWatch();
  });
  return {
    tableListConfig,
    searchConfig,
    totalPage,
    sortChange,
    sorterChange,
    resetPage,
    submitSearch,
    resetSearch,
    onWatch,
    offWatch,
    resetTableList,
  };
}
