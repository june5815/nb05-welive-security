import fs from "fs";
import path from "path";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { IConfigUtil } from "../../shared/utils/config.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";
import { RequestHandler } from "express";

export interface IMulterMiddleware {
  uploadSingle: () => RequestHandler;
}

export const MulterMiddleware = (configUtil: IConfigUtil) => {
  const nodeEnv = configUtil.parsed().NODE_ENV;
  const isProduction = nodeEnv === "production";

  const getPath = (configUtil: IConfigUtil) => {
    if (!fs.existsSync(configUtil.parsed().PUBLIC_PATH)) {
      fs.mkdirSync(configUtil.parsed().PUBLIC_PATH, {
        recursive: true,
      });
    }
    return configUtil.parsed().PUBLIC_PATH;
  };

  const getFileName = (originalname: string) => {
    const ext = path.extname(originalname);
    return path.basename(originalname, ext) + "." + Date.now() + ext;
  };

  // 현재 fileFilter는 이미지만 업로드가 가능하게 설정됨
  // 차후 CSV 파일 업로드에 필요한 내용을 추가하거나 CSV 업로드용 fileFilter를 새로 생성할 필요성을 고려해야 함
  const fileFilter = (req: any, file: any, callback: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return callback(null, true);
    } else {
      return callback(
        new BusinessException({
          type: BusinessExceptionType.INVALID_INPUT_IMAGE,
        }),
      );
    }
  };

  const limits = {
    fileSize: 5 * 1024 * 1024,
  };

  const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, getPath(configUtil));
    },
    filename: (req, file, callback) => {
      callback(null, getFileName(file.originalname));
    },
  });

  const s3Storage = multerS3({
    s3: new S3Client({
      region: configUtil.parsed().S3_REGION,
      credentials: {
        accessKeyId: configUtil.parsed().S3_ACCESS_KEY_ID,
        secretAccessKey: configUtil.parsed().S3_SECRET_ACCESS_KEY,
      },
    }),
    bucket: configUtil.parsed().S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: any, file: any, callback: any) => {
      callback(null, getFileName(file.originalname));
    },
    acl: "public-read",
  });

  const storage = isProduction ? s3Storage : diskStorage;

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
  });

  const uploadSingle = () => {
    return upload.single("avatarImage");
  };

  return {
    uploadSingle,
  };
};
