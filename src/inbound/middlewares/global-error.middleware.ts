import { NextFunction, Request, Response } from "express";
import { IConfigUtil } from "../../shared/utils/config.util";
import { BusinessException } from "../../shared/exceptions/business.exception";
import { TechnicalException } from "../../shared/exceptions/technical.exception";

export interface IGlobalErrorMiddleware {
  globalErrorHandler: (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}

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
