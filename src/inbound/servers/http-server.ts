import express, { Application } from "express";
import http, { Server as DefaultHttpServer } from "http";
import { IConfigUtil } from "../../shared/utils/config.util";
import { ICookieMiddleware } from "../middlewares/cookie.middleware";
import { ICorsMiddleware } from "../middlewares/cors.middleware";
import { IGlobalErrorMiddleware } from "../middlewares/global-error.middleware";
import { IJsonMiddleware } from "../middlewares/json.middleware";
import { ILoggerMiddleware } from "../middlewares/logger.middleware";
import { INotFoundErrorMiddleware } from "../middlewares/not-found-error.middleware";
import { IStaticServeMiddleware } from "../middlewares/static-serve.middleware";
import { IAuthRouter } from "../routers/auth.router";
import { IUserRouter } from "../routers/user.router";

export interface IHttpServer {
  start: () => void;
}

export const HttpServer = (
  configUtil: IConfigUtil,
  cookieMiddleware: ICookieMiddleware,
  corsMiddleware: ICorsMiddleware,
  globalErrorMiddleware: IGlobalErrorMiddleware,
  jsonMiddleware: IJsonMiddleware,
  loggerMiddleware: ILoggerMiddleware,
  notFoundErrorMiddleware: INotFoundErrorMiddleware,
  staticServeMiddleware: IStaticServeMiddleware,
  authRouter: IAuthRouter,
  userRouter: IUserRouter,
): IHttpServer => {
  const app: Application = express();
  const defaultHttpServer: DefaultHttpServer = http.createServer(app);

  // middlewares
  app.use(loggerMiddleware.loggerHandler());
  app.use(corsMiddleware.corsHandler());
  app.use(jsonMiddleware.jsonHandler());
  app.use(cookieMiddleware.cookieHandler());

  // controllers
  app.use(authRouter.PATH, authRouter.router);
  app.use(userRouter.PATH, userRouter.router);

  // static
  app.use(staticServeMiddleware.staticServeHandler());

  // errors
  app.use(notFoundErrorMiddleware.notFoundErrorHandler);
  app.use(globalErrorMiddleware.globalErrorHandler);

  const start = () => {
    defaultHttpServer.listen(configUtil.parsed().PORT, () => {
      console.log(`Listening on port ${configUtil.parsed().PORT}`);
    });
  };

  return {
    start,
  };
};
