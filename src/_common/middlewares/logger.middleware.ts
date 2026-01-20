import morgan from "morgan";
import { IConfigUtil } from "../utils/config.util";
import { ILoggerMiddleware } from "../ports/middlewares/logger-middleware.interface";

export const LoggerMiddleware = (
  configUtil: IConfigUtil,
): ILoggerMiddleware => {
  const format =
    configUtil.parsed().NODE_ENV === "development" ? "dev" : "combined";

  const loggerHandler = () => {
    return morgan(format);
  };

  return {
    loggerHandler,
  };
};
