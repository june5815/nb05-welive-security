import { NextFunction, Request, Response } from "express";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";
import { TUserRole } from "../../shared/utils/token.util";

export interface IRoleMiddleware {
  hasRole: (
    allowedRoles: TUserRole[],
  ) => (req: Request, res: Response, next: NextFunction) => void;
}

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
