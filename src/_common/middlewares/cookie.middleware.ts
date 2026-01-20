import cookieParser from "cookie-parser";
import { IConfigUtil } from "../utils/config.util";
import { ICookieMiddleware } from "../ports/middlewares/cookie-middleware.interface";

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
