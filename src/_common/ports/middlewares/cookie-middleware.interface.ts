import { RequestHandler } from "express";

export interface ICookieMiddleware {
  cookieHandler: () => RequestHandler;
}
