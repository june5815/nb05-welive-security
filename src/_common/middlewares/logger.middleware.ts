import morgan from "morgan";
import { IConfigUtil } from "../utils/config.util";
import { ILoggerMiddleware } from "../ports/middlewares/logger-middleware.interface";

export const LoggerMiddleware = (
  configUtil: IConfigUtil,
): ILoggerMiddleware => {
  const format =
    configUtil.parsed().NODE_ENV === "development" ? "dev" : "combined";

  const loggerHandler = () => {
    const skip = (req: any, res: any) => {
      return req.path === "/api/v2/notifications/sse";
    };

    return morgan(format, { skip });
  };

  return {
    loggerHandler,
  };
};
