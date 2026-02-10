import { RequestHandler } from "express";

export interface ICorsMiddleware {
  corsHandler: () => RequestHandler;
}
