import { NextFunction, Request, Response } from "express";

export interface IGlobalErrorMiddleware {
  globalErrorHandler: (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}
