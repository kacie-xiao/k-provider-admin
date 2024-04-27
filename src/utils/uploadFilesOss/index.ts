import axios from "axios";
import { util } from "./crypto";
import HMAC from "./hmac";
import SHA1 from "./sha1";
import Base64 from "./Base64";

const options = {
  accessKeyId: "",
  accessKeySecret: "",
  bucket: "",
  visitPrefix: "",
  folderPath: import.meta.env.MODE === "buildEnv" ? "upload-files/" : "test/",
};

// 获取policy
function getPolicyBase64(timeout?: number) {
  let date = new Date(new Date().getTime() + (timeout || 5 * 60 * 1000));
  const policyText = {
    expiration: date.toISOString(), //设置该Policy的失效时间
    conditions: [
      ["content-length-range", 0, 100 * 1024 * 1024], // 设置上传文件的大小限制,100mb
    ],
  };
  return Base64.encode(JSON.stringify(policyText));
}

// 获取签名
function getSignature(policyBase64: string, AccessKeySecret: string) {
  const bytes = HMAC(SHA1, policyBase64, AccessKeySecret, {
    asBytes: true,
  });
  return util.bytesToBase64(bytes);
}

const service = axios.create({
  baseURL: import.meta.env.VITE_UPLOAD_URL,
  timeout: 5 * 60 * 1000,
  headers: { "Access-Control-Allow-Origin": "*" },
});
service.interceptors.response.use(
  (res): any => {
    if (res.status === 200) {
      const url = (<FormData>res.config.data).get("key");
      return Promise.resolve(`${options.visitPrefix}/${url}`);
    } else {
      return Promise.reject(false);
    }
  },
  (err) => {
    return Promise.reject(err);
  },
);

export function AilUploadImage(files: File): Promise<string> {
  const policy = getPolicyBase64();
  const signature = getSignature(policy, options.accessKeySecret);
  const formData = new FormData();
  formData.append(
    "key",
    `${options.folderPath}${Date.now()}${Math.round(
      Math.random() * 100,
    )}.${files.type.replace("image/", "")}`,
  );
  formData.append("name", "file");
  formData.append("policy", policy);
  formData.append("OSSAccessKeyId", options.accessKeyId);
  formData.append("success_action_status", "200");
  formData.append("Signature", signature);
  formData.append("file", files);
  return service.post(import.meta.env.VITE_UPLOAD_URL as any, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
