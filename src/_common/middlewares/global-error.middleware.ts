import { NextFunction, Request, Response } from "express";
import { IConfigUtil } from "../utils/config.util";
import { BusinessException } from "../exceptions/business.exception";
import { TechnicalException } from "../exceptions/technical.exception";
import { IGlobalErrorMiddleware } from "../ports/middlewares/global-error-middleware.interface";

export const GlobalErrorMiddleware = (
  configUtil: IConfigUtil,
): IGlobalErrorMiddleware => {
  const globalErrorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const nodeEnv = configUtil.parsed().NODE_ENV;

    if (error instanceof BusinessException) {
      const { statusCode, message } = error;

      if (nodeEnv === "development") {
        console.log("[BusinessError]: ", statusCode, message);
      }

      res.status(statusCode).json({ message });
      return;
    }

    if (error instanceof TechnicalException) {
      const { message } = error;
      const clientMessage =
        nodeEnv === "development" ? message : "잠시 후 다시 시도해주세요.";

      if (nodeEnv === "development") {
        console.log("[TechnicalError]: ", message);
      }

      res.status(500).json({ message: clientMessage });
      return;
    }

    res.status(500).json({ message: "알 수 없는 에러가 발생했습니다." });
    console.error("[UnknownError]: ", error);
    return;
  };

  return {
    globalErrorHandler,
  };
};
