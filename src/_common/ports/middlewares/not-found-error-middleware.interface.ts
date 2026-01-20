import { Request, Response, NextFunction } from "express";

export interface INotFoundErrorMiddleware {
  notFoundErrorHandler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}
