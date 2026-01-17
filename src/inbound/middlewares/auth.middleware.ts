import { NextFunction, Request, Response } from "express";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";
import { ITokenUtil } from "../../shared/utils/token.util";

export interface IAuthMiddleware {
  blockCsrfAttack: (req: Request, res: Response, next: NextFunction) => void;
  checkAuth: (req: Request, res: Response, next: NextFunction) => void;
}

export const AuthMiddleware = (tokenUtil: ITokenUtil): IAuthMiddleware => {
  const blockCsrfAttack = (req: Request, res: Response, next: NextFunction) => {
    const csrfValueHeader = req.headers["x-csrf-value"];
    const csrfValueCookie = req.signedCookies.csrfValue;
    if (
      !csrfValueHeader ||
      !csrfValueCookie ||
      csrfValueHeader !== csrfValueCookie
    ) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }

    return next();
  };

  const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (
      !authHeader ||
      authHeader.split(" ").length !== 2 ||
      authHeader.split(" ")[0] !== "Bearer"
    ) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const payload = tokenUtil.verifyToken({
      token: accessToken,
      type: "ACCESS",
    });
    req.userId = payload.userId;
    if (!req.userId) {
      throw new BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }
    return next();
  };

  return {
    blockCsrfAttack,
    checkAuth,
  };
};
