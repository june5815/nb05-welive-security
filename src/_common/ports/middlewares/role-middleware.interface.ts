import { NextFunction, Request, Response } from "express";
import { TUserRole } from "../../utils/token.util";

export interface IRoleMiddleware {
  hasRole: (
    allowedRoles: TUserRole[],
  ) => (req: Request, res: Response, next: NextFunction) => void;
}
