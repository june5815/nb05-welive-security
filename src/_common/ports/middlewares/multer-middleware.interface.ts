import { RequestHandler } from "express";

export interface IMulterMiddleware {
  uploadSingle: () => RequestHandler;
}
