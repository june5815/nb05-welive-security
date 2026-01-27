import express, { Application } from "express";
import http, { Server as DefaultHttpServer } from "http";
import { IConfigUtil } from "../_common/utils/config.util";
import { ICookieMiddleware } from "../_common/ports/middlewares/cookie-middleware.interface";
import { ICorsMiddleware } from "../_common/ports/middlewares/cors-middleware.interface";
import { IGlobalErrorMiddleware } from "../_common/ports/middlewares/global-error-middleware.interface";
import { IJsonMiddleware } from "../_common/ports/middlewares/json-middleware.interface";
import { ILoggerMiddleware } from "../_common/ports/middlewares/logger-middleware.interface";
import { INotFoundErrorMiddleware } from "../_common/ports/middlewares/not-found-error-middleware.interface";
import { IStaticServeMiddleware } from "../_common/ports/middlewares/static-serve-middleware.interface";
import { IAuthRouter } from "../_modules/auth/auth.router";
import { IUserRouter } from "../_modules/users/user.router";
import { INoticeRouter } from "../_modules/notices/notice.routes";

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
  noticeRouter: INoticeRouter,
): IHttpServer => {
  const app: Application = express();
  const defaultHttpServer: DefaultHttpServer = http.createServer(app);

  // middlewares
  app.use(loggerMiddleware.loggerHandler());
  app.use(corsMiddleware.corsHandler());
  app.use(jsonMiddleware.jsonHandler());
  app.use(cookieMiddleware.cookieHandler());

  // routers
  app.use(authRouter.PATH, authRouter.router);
  app.use(userRouter.PATH, userRouter.router);
  app.use(noticeRouter.PATH, noticeRouter.router);

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
