<script lang="ts" name="product-select" setup>
import { ElButton, ElImage, ElMessage, FormInstance, FormRules } from 'element-plus';
import { DataTableColumns, NDataTable } from 'naive-ui';
import { h, nextTick, reactive, ref } from 'vue';

import {
  getProductSearchList,
  getProductSearchListParamsInterface,
  getProductSearchListReturnInterface,
} from '@/api/global';
import { useTableList } from '@/utils/hooks';

export interface productSelectSubmitInterface {
  products: getProductSearchListReturnInterface[];
  rate: string;
  discount: string;
}

const $Props = defineProps<{
  filterType: 'kocProduct' | 'designerProduct';
  filterId: string | number;
  rate: { max: string; min: string };
}>();

const Emits = defineEmits<{
  (event: 'submit', params: productSelectSubmitInterface): void;
}>();

const drawerSwicth = ref(false);

const checkedRowKeys = ref<number[]>([]);
const checkedRows = ref<getProductSearchListReturnInterface[]>([]);
function changeCheckedRowKeys(
  keys: Array<number>,
  rows: getProductSearchListReturnInterface[],
  meta:
    | {
        row: undefined;
        action: 'checkAll' | 'uncheckAll';
      }
    | { row: getProductSearchListReturnInterface; action: 'check' | 'uncheck' },
) {
  if (meta.row) {
    if (meta.action === 'check') {
      checkedRows.value.push(meta.row);
    } else {
      checkedRows.value = checkedRows.value.filter((el) => el.id !== meta.row.id);
    }
  } else if (meta.action === 'checkAll') {
    tableListConfig.list.forEach((item) => {
      const index = checkedRows.value.findIndex((el) => el.id === item.id);
      if (index < 0) {
        checkedRows.value.push(item);
      }
    });
  } else {
    tableListConfig.list.forEach((item) => {
      const index = checkedRows.value.findIndex((el) => el.id === item.id);
      if (index >= 0) {
        checkedRows.value.splice(index, 1);
      }
    });
  }
}
function showDrawerSwicth() {
  resetSearch().catch(() => {
    resetPage();
  });
  nextTick(() => {
    drawerSwicth.value = true;
  });
}

function hideDrawerSwicth() {
  if (drawerSwicth.value) {
    drawerSwicth.value = false;
    checkedRowKeys.value = [];
    checkedRows.value = [];
    isSubmit.value = false;
    form.rate = '';
    form.discount = '';
  }
}

const columns: DataTableColumns<getProductSearchListReturnInterface> = [
  {
    type: 'selection',
  },
  {
    key: 'id',
    title: '产品编号',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'title',
    title: '产品名称',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'cover',
    title: '产品图片',
    render(rowData: getProductSearchListReturnInterface) {
      return h(ElImage, {
        src: rowData.cover,
        lazy: true,
        fit: 'contain',
        previewTeleported: true,
        previewSrcList: [rowData.cover],
        style: { width: '60px', height: '60px' },
      });
    },
  },
  {
    key: 'sale_price',
    title: '产品售价',
  },
  {
    key: 'stock',
    title: '库存(件)',
  },
];
const submitColumns: DataTableColumns<getProductSearchListReturnInterface> = [
  {
    key: 'id',
    title: '产品编号',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'title',
    title: '产品名称',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'cover',
    title: '产品图片',
    render(rowData: getProductSearchListReturnInterface) {
      return h(ElImage, {
        src: rowData.cover,
        lazy: true,
        fit: 'contain',
        previewTeleported: true,
        previewSrcList: [rowData.cover],
        style: { width: '60px', height: '60px' },
      });
    },
  },
  {
    key: 'sale_price',
    title: '产品售价',
  },
  {
    key: 'stock',
    title: '库存(件)',
  },
  {
    key: 'options',
    title: '操作',
    render(rowData: getProductSearchListReturnInterface, rowIndex: number) {
      return h(
        ElButton,
        {
          type: 'danger',
          size: 'small',
          onClick: (): void => {
            checkedRows.value.splice(rowIndex, 1);
          },
        },
        () => '删除',
      );
    },
  },
];
function getRowKey(rowData: getProductSearchListReturnInterface) {
  return rowData.id;
}

/**
 * 编辑佣金折扣
 */
const editFormRef = ref<FormInstance>();
const isSubmit = ref(false);
const form = reactive({
  rate: '',
  discount: '',
});

const formRules = reactive<FormRules>({
  rate: [
    {
      required: true,
      message: '请设置产品佣金',
      trigger: 'blur',
    },
    {
      validator: (rule, value) => {
        return !Number.isNaN(Number(value));
      },
      message: '请设置正确的产品佣金',
      trigger: 'change',
    },
    {
      validator: (rule, value) => {
        console.log($Props.rate);
        return Number(value) >= Number($Props.rate.min) && Number(value) <= Number($Props.rate.max);
      },
      message: `产品佣金最小可设置为${$Props.rate.min}%，最大可设置为${$Props.rate.max}%`,
      trigger: 'change',
    },
  ],
  discount: [
    {
      required: true,
      message: '请设置产品专属折扣',
      trigger: 'blur',
    },
    {
      validator: (rule, value) => {
        return !Number.isNaN(Number(value));
      },
      message: '请设置正确的专属折扣',
      trigger: 'change',
    },
    {
      validator: (rule, value) => {
        console.log($Props.rate);
        return Number(value) > 0 && Number(value) <= 10;
      },
      message: '全场折扣设置范围0.1-10折',
      trigger: 'change',
    },
  ],
});

const defaultSearch = {
  item_id: '', // 产品编号
  title: '', // 产品名称
  stockMin: '', // 产品库存最小值
  stockMax: '', // 产品库存最大值
  priceMin: '', // 产品售价最小值
  priceMax: '', // 产品售价最大值
};

const { tableListConfig, searchConfig, resetSearch, submitSearch, resetPage } = useTableList<
  getProductSearchListReturnInterface,
  typeof defaultSearch
>(defaultSearch, {
  load_list_fun: loadTableDataList,
});

function loadTableDataList() {
  return new Promise<void>((resolve) => {
    tableListConfig.hasLoading = true;
    const requestConfig: getProductSearchListParamsInterface = {
      page: tableListConfig.page,
      'per-page': tableListConfig.pageSize,
      sort: tableListConfig.sort,
      'ItemFilterSearch[filterId]': String($Props.filterId),
      'ItemFilterSearch[filterType]': $Props.filterType,
      'ItemFilterSearch[item_id]': '',
      'ItemFilterSearch[title]': '',
      'ItemFilterSearch[stockMin]': '',
      'ItemFilterSearch[stockMax]': '',
      'ItemFilterSearch[priceMin]': '',
      'ItemFilterSearch[priceMax]': '',
    };
    if (tableListConfig.hasSearch) {
      requestConfig['ItemFilterSearch[item_id]'] = searchConfig.item_id;
      requestConfig['ItemFilterSearch[title]'] = searchConfig.title;
      requestConfig['ItemFilterSearch[stockMin]'] = searchConfig.stockMin;
      requestConfig['ItemFilterSearch[stockMax]'] = searchConfig.stockMax;
      requestConfig['ItemFilterSearch[priceMin]'] = searchConfig.priceMin;
      requestConfig['ItemFilterSearch[priceMax]'] = searchConfig.priceMax;
    }
    getProductSearchList({ ...requestConfig })
      .then((res) => {
        tableListConfig.list = res.data;
        tableListConfig.total = Number(res.total);
        tableListConfig.hasLoading = false;
        resolve();
      })
      .catch(() => {
        tableListConfig.hasLoading = false;
        resolve();
      });
  });
}

// 选择完毕
function selectEnd() {
  if (checkedRows.value.length) {
    isSubmit.value = true;
  } else {
    ElMessage.error('您还未选择商品');
  }
}

// 重新选择
function startSelect() {
  isSubmit.value = false;
}

// 提交
function onProductSubmit() {
  editFormRef.value?.validate().then(() => {
    Emits('submit', {
      products: checkedRows.value,
      ...form,
    });
    nextTick(() => {
      hideDrawerSwicth();
    });
  });
}

defineExpose({ showDrawerSwicth });
</script>
<template>
  <div class="product-select">
    <el-dialog
      v-model="drawerSwicth"
      :destroy-on-close="true"
      :append-to-body="true"
      width="auto"
      title="选择产品"
      @close="hideDrawerSwicth"
    >
      <div class="product-dialog">
        <div v-show="!isSubmit">
          <el-form :model="searchConfig" size="default" class="mb-4">
            <el-space size="default" :wrap="true" class="w-full">
              <el-form-item label="产品编号:" prop="item_id">
                <div class="form-item-small">
                  <el-input
                    v-model.trim="searchConfig.item_id"
                    :clearable="true"
                    maxlength="16"
                    placeholder="请输入产品编号"
                  >
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="产品名称:" prop="title">
                <div class="form-item-small">
                  <el-input
                    v-model.trim="searchConfig.title"
                    :clearable="true"
                    maxlength="32"
                    placeholder="请输入产品名称"
                  >
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="产品库存:" prop="stockMin">
                <div class="form-item-small flex justify-between items-center">
                  <el-input
                    v-model.trim="searchConfig.stockMin"
                    maxlength="16"
                    :clearable="true"
                    placeholder="请输入"
                    class="flex-1"
                  ></el-input>
                  <div class="ml-2 mr-2">-</div>
                  <el-input
                    v-model.trim="searchConfig.stockMax"
                    maxlength="16"
                    :clearable="true"
                    placeholder="请输入"
                    class="flex-1"
                  ></el-input>
                </div>
              </el-form-item>
              <el-form-item label="产品售价:" prop="priceMin">
                <div class="form-item-small flex justify-between items-center">
                  <el-input
                    v-model.trim="searchConfig.priceMin"
                    maxlength="16"
                    :clearable="true"
                    placeholder="请输入"
                    class="flex-1"
                  ></el-input>
                  <div class="ml-2 mr-2">-</div>
                  <el-input
                    v-model.trim="searchConfig.priceMax"
                    maxlength="16"
                    :clearable="true"
                    placeholder="请输入"
                    class="flex-1"
                  ></el-input>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button size="default" @click="resetSearch"> 重置 </el-button>
                <el-button icon="ele-Search" size="default" type="primary" @click="submitSearch"> 搜索 </el-button>
              </el-form-item>
            </el-space>
          </el-form>
          <n-data-table
            v-model:checked-row-keys="checkedRowKeys"
            :row-key="getRowKey"
            :columns="columns"
            :data="tableListConfig.list"
            :loading="tableListConfig.hasLoading"
            size="small"
            :min-height="400"
            :max-height="800"
            :flex-height="true"
            @update:checked-row-keys="changeCheckedRowKeys"
          >
            <template #empty> 暂无相关产品 </template>
          </n-data-table>
        </div>
        <div v-if="isSubmit" class="px-4">
          <h3>已选择</h3>
          <el-divider class="mt10"></el-divider>
          <n-data-table
            :columns="submitColumns"
            :data="checkedRows"
            size="small"
            :min-height="300"
            :max-height="800"
            :flex-height="true"
          >
          </n-data-table>
          <el-form
            ref="editFormRef"
            :scroll-to-error="true"
            :model="form"
            :rules="formRules"
            class="mt-4"
            size="default"
          >
            <el-form-item label="设置佣金:" prop="rate">
              <div>
                <div class="form-item-small mb-2">
                  <el-input v-model.trim="form.rate" :clearable="true" placeholder="请设置产品佣金">
                    <template #suffix>%</template>
                  </el-input>
                </div>
                <div class="text-xs" style="color: var(--el-text-color-regular)">
                  平台默认商家给
                  {{ filterType === 'kocProduct' ? '达人' : '衣匠' }}
                  的佣金是1%-5%，请谨慎设置
                  {{ filterType === 'kocProduct' ? '达人' : '衣匠' }}
                  佣金。当前可设置佣金最小值(
                  <span class="color-danger"> {{ rate.min }}% </span>
                  )，最大值为(
                  <span class="color-danger">{{ rate.max }}%</span>)。
                </div>
              </div>
            </el-form-item>
            <el-form-item v-if="filterType === 'kocProduct'" label="设置折扣:" prop="discount">
              <div class="form-item-small">
                <el-input v-model.trim="form.discount" :clearable="true" placeholder="请设置产品专属折扣">
                  <template #suffix>折</template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <el-pagination
              v-show="!isSubmit"
              v-model:current-page="tableListConfig.page"
              :small="true"
              :background="true"
              :page-size="tableListConfig.pageSize"
              :total="tableListConfig.total"
              layout="total,->,prev,pager,next"
            >
            </el-pagination>
          </div>
          <div class="ml-10">
            <el-button size="default" @click="hideDrawerSwicth">取消</el-button>
            <el-button v-show="!isSubmit" size="default" type="success" @click="selectEnd"> 选择完毕 </el-button>
            <el-button v-show="isSubmit" size="default" type="success" @click="startSelect"> 重新选择 </el-button>
            <el-button v-show="isSubmit" size="default" type="primary" @click="onProductSubmit"> 提交 </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.product-dialog {
  min-width: 500px;
  max-width: 1000px;
}
</style>
