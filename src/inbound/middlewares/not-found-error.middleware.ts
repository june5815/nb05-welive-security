import { Request, Response, NextFunction } from "express";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";

export interface INotFoundErrorMiddleware {
  notFoundErrorHandler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}

export const NotFoundErrorMiddleware = (): INotFoundErrorMiddleware => {
  const notFoundErrorHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    next(new BusinessException({ type: BusinessExceptionType.NOT_FOUND }));
  };

  return {
    notFoundErrorHandler,
  };
};
