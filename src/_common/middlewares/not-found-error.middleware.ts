import { Request, Response, NextFunction } from "express";
import {
  BusinessException,
  BusinessExceptionType,
} from "../exceptions/business.exception";
import { INotFoundErrorMiddleware } from "../ports/middlewares/not-found-error-middleware.interface";

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
