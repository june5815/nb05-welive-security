import cors from "cors";
import { RequestHandler } from "express";
import { IConfigUtil } from "../../shared/utils/config.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";

export interface ICorsMiddleware {
  corsHandler: () => RequestHandler;
}

export const CorsMiddleware = (configUtil: IConfigUtil): ICorsMiddleware => {
  const protocol =
    configUtil.parsed().NODE_ENV === "development" ? "http" : "https";
  const clientDomain =
    configUtil.parsed().NODE_ENV === "development"
      ? `localhost:${configUtil.parsed().FE_PORT}`
      : configUtil.parsed().CLIENT_DOMAIN;
  const whitelist = [
    `${protocol}://${clientDomain}`,
    `${protocol}://www.${clientDomain}`,
  ];

  const options: cors.CorsOptions = {};
  options.origin = function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(
        new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
        }),
      );
    }
  };
  options.credentials = true;

  const corsHandler = () => {
    return cors(options);
  };

  return {
    corsHandler,
  };
};
