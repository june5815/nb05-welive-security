import morgan from "morgan";
import { IConfigUtil } from "../../shared/utils/config.util";
import { Handler } from "express";

export interface ILoggerMiddleware {
  loggerHandler: () => Handler;
}

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
