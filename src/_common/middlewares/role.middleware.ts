import { NextFunction, Request, Response } from "express";
import {
  BusinessException,
  BusinessExceptionType,
} from "../exceptions/business.exception";
import { TUserRole } from "../utils/token.util";
import { IRoleMiddleware } from "../ports/middlewares/role-middleware.interface";

export const RoleMiddleware = (): IRoleMiddleware => {
  const hasRole = (allowedRoles: TUserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.userRole as TUserRole;

      if (!userRole) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
        });
      }

      if (allowedRoles.includes(userRole)) {
        return next();
      } else {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
        });
      }
    };
  };

  return {
    hasRole,
  };
};
