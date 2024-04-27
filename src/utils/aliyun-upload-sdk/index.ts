import { GetVodAuth } from "@/api/global";

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
  videoInfo: {
    Title: string;
    duration: number;
    size: number;
    upload_time: string;
  };
  _bucket: null | string;
  _endpoint: null | string;
  _object: null | string;
  videoId?: string;
}

interface UploadVideoOptions {
  onUploadstarted?: () => any;
  onUploadFailed?: () => any;
  onUploadProgress?: (progress: number) => any;
  onUploadSucceed?: (url: string, uploadInfo: uploadInfoInterface) => any;
}
class UploadVideo {
  upload: any;
  constructor(params?: UploadVideoOptions) {
    const upload = new (<any>window).AliyunUpload.Vod({
      timeout: 60000,
      region: "cn-shanghai",
      userId: "1218482854134723",
      addFileSuccess(uploadInfo: uploadInfoInterface) {
        return uploadInfo;
      },
      onUploadstarted(uploadInfo: uploadInfoInterface) {
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
            VideoId,
          );
          params && params.onUploadstarted && params.onUploadstarted();
        });
      },
      onUploadFailed() {
        params && params.onUploadFailed && params.onUploadFailed();
      },
      onUploadProgress(
        uploadInfo: uploadInfoInterface,
        totalSize: number,
        progress: number,
      ) {
        params && params.onUploadProgress && params.onUploadProgress(progress);
      },
      onUploadTokenExpired(uploadInfo: uploadInfoInterface) {
        GetVodAuth({
          fileName: uploadInfo.file.name,
          title: `${uploadInfo.file.lastModified}`,
          type: 2617,
        }).then((res) => {
          const { UploadAuth } = res.data;
          upload.resumeUploadWithAuth(UploadAuth);
        });
      },
      onUploadSucceed(uploadInfo: uploadInfoInterface) {
        const url = `https://${uploadInfo.bucket}.oss-cn-shenzhen.aliyuncs.com/${uploadInfo.object}`;
        params &&
          params.onUploadSucceed &&
          params.onUploadSucceed(url, uploadInfo);
      },
    });
    this.upload = upload;
  }
}
export default UploadVideo;
