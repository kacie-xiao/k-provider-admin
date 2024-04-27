<template>
  <div class="editor-container">
    <toolbar
      v-show="!disable"
      :editor="editorRef"
      :mode="mode"
      :default-config="state.toolbarConfig"
    />
    <editor
      class="w-full"
      :style="{ height, minHeight }"
      v-model="state.editorVal"
      :mode="mode"
      :default-config="state.editorConfig"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script name="my-editor" lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css";

import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useMessage } from "naive-ui";
import { onBeforeUnmount, reactive, shallowRef, watch } from "vue";
import { AilUploadImage } from "@/utils/uploadFilesOss";
import { GetVodAuth } from "@/api/global";

const $naiveMessage = useMessage();

/**
 * 定义父组件传过来的值
 */
const $props = withDefaults(
  defineProps<{
    disable: boolean; // 是否禁用
    placeholder: string; // 内容框默认 placeholder
    mode: string; // 模式，可选 <default|simple>，默认 default
    getHtml: string; // 双向绑定，用于获取 editor.getHtml()
    getText?: string; // 双向绑定，用于获取 editor.getText()
    height: string;
    minHeight: string;
  }>(),
  {
    disable: false,
    placeholder: "请输入内容...",
    mode: "default",
    height: "400px",
    minHeight: "300px",
  }
);

// 定义子组件向父组件传值/事件
const emit = defineEmits(["update:getHtml", "update:getText"]);

// 定义变量内容
const editorRef = shallowRef<IDomEditor>();
interface stateInterface {
  toolbarConfig: Partial<IToolbarConfig>;
  editorConfig: Partial<IEditorConfig>;
  editorVal: string;
}
type InsertFnType = (url: string) => void;

const state = reactive<stateInterface>({
  toolbarConfig: {
    excludeKeys: ["emotion", "codeBlock", "fullScreen"],
  },
  editorConfig: {
    placeholder: $props.placeholder,
    readOnly: $props.disable,
    MENU_CONF: {
      uploadImage: {
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ["image/jpeg", "image/jpg", "image/png"],
        customUpload: (file: File, InsertFn: InsertFnType) => {
          AilUploadImage(file)
            .then((res) => {
              InsertFn(res);
            })
            .catch(() => {
              $naiveMessage.error("上传失败");
            });
        },
      },
      uploadVideo: {
        maxFileSize: 100 * 1024 * 1024,
        customUpload: (file: File, InsertFn: InsertFnType) => {
          interface uploadInfoInterface {
            bucket?: string;
            checkpoint?: {
              doneParts: {
                etag: string;
                number: number;
              }[];
              file: File;
              fileSize: number;
              name: string;
              partSize: number;
              uploadId: string;
            };
            endpoint?: string;
            file: File;
            fileHash: string;
            isImage: boolean;
            loaded?: number;
            object?: string;
            region?: string;
            retry?: boolean;
            ri: string;
            state: string;
            userData: string;
            videoInfo: object;
            _bucket: null | string;
            _endpoint: null | string;
            _object: null | string;
            videoId?: string;
          }

          const upload = new (<any>window).AliyunUpload.Vod({
            timeout: 60000,
            region: "cn-shanghai",
            userId: "1218482854134723",
            addFileSuccess: function (uploadInfo: uploadInfoInterface) {
              return uploadInfo;
            },
            onUploadstarted: function (uploadInfo: uploadInfoInterface) {
              GetVodAuth({
                fileName: uploadInfo.file.name,
                title: `${uploadInfo.file.lastModified}`,
                type: 2617,
              }).then((res) => {
                const { UploadAuth, UploadAddress, VideoId } = res.data;
                upload.setUploadAuthAndAddress(
                  uploadInfo,
                  UploadAuth,
                  UploadAddress,
                  VideoId
                );
              });
            },
            onUploadFailed: function () {
              $naiveMessage.error("文件上传失败!");
            },
            onUploadTokenExpired: function (uploadInfo: uploadInfoInterface) {
              GetVodAuth({
                fileName: uploadInfo.file.name,
                title: `${uploadInfo.file.lastModified}`,
                type: 2617,
              }).then((res) => {
                const { UploadAuth } = res.data;
                upload.resumeUploadWithAuth(UploadAuth);
              });
            },
            onUploadSucceed: function (uploadInfo: uploadInfoInterface) {
              const url = `https://${uploadInfo.bucket}.oss-cn-shenzhen.aliyuncs.com/${uploadInfo.object}`;
              InsertFn(url);
            },
          });
          upload.addFile(
            file,
            null,
            null,
            null,
            JSON.stringify({ Vod: { Title: file.lastModified } })
          );
          upload.startUpload();
        },
      },
    },
  },
  editorVal: $props.getHtml,
});

// 编辑器回调函数
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

// 编辑器内容改变时
const handleChange = (editor: IDomEditor) => {
  emit("update:getHtml", editor.getHtml());
  emit("update:getText", editor.getText());
};
// 页面销毁时
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (!editor) return;
  editor.destroy();
});
// 监听是否禁用改变
// https://gitee.com/lyt-top/vue-next-admin/issues/I4LM7I
watch(
  () => $props.disable,
  (bool) => {
    if (!editorRef.value) return;
    if (bool) {
      editorRef.value.disable();
    } else {
      editorRef.value.enable();
    }
  },
  {
    deep: true,
  }
);
// 监听双向绑定值改变，用于回显
watch(
  () => $props.getHtml,
  (val) => {
    state.editorVal = val;
  },
  {
    deep: true,
  }
);
</script>
