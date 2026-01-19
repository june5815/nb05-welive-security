import cookieParser from "cookie-parser";
import { IConfigUtil } from "../../shared/utils/config.util";
import { RequestHandler } from "express";

export interface ICookieMiddleware {
  cookieHandler: () => RequestHandler;
}

export const CookieMiddleware = (
  configUtil: IConfigUtil,
): ICookieMiddleware => {
  const cookieSecret = configUtil.parsed().COOKIE_SECRET;

  const cookieHandler = () => {
    return cookieParser(cookieSecret);
  };

  return {
    cookieHandler,
  };
};
