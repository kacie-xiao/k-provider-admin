import { reactive } from "vue";

export function globalSortChange({ prop, order }: globalSortChangeType) {
  let sort: string = "";
  if (prop && order) {
    if (order === "descending") {
      sort = `-${prop}`;
    } else {
      sort = prop;
    }
  }
  return sort;
}
interface tableDataConfig<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  isSearch: boolean;
  sort: string;
}
export function useTableLongList<listType>() {
  const tableDataConfig = reactive<tableDataConfig<listType>>({
    list: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    isSearch: false,
    sort: "",
  });
  return { tableDataConfig };
}
