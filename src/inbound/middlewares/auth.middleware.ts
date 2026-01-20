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
    const accessToken = req.signedCookies.access_token;
    if (!accessToken) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }

    const payload = tokenUtil.verifyToken({
      token: accessToken,
      type: "ACCESS",
    });

    req.userId = payload.userId;
    req.userRole = payload.role;
    if (!req.userId) {
      throw new BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }
    if (!req.userRole) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    return next();
  };

  return {
    blockCsrfAttack,
    checkAuth,
  };
};
