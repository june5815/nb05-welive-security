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
import { IApartmentRouter } from "../_modules/apartments/apartment.router";
import { IResidentRouter } from "../_modules/residents/resident.router";
import { INoticeRouter } from "../_modules/notices/notice.routes";
import { ICommentRouter } from "../_modules/comments/routes";
import { IEventRouter } from "../_modules/events/routes";
import { INotificationRouter } from "../_modules/notification/notification.router";
import { IComplaintRouter } from "../_modules/complaints/complaint.router";
import { IPollRouter } from "../_modules/polls/poll.routes";

export interface IHttpServer {
  start: () => void;
  app: Application;
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
  apartmentRouter: IApartmentRouter,
  residentRouter: IResidentRouter,
  noticeRouter: INoticeRouter,
  pollRouter: IPollRouter,
  commentRouter: ICommentRouter,
  eventRouter: IEventRouter,
  notificationRouter: INotificationRouter,
  complaintRouter: IComplaintRouter,
): IHttpServer => {
  const app: Application = express();
  const defaultHttpServer: DefaultHttpServer = http.createServer(app);

  // middlewares
  app.use(loggerMiddleware.loggerHandler());
  app.use(corsMiddleware.corsHandler());
  app.use(jsonMiddleware.jsonHandler());
  app.use(cookieMiddleware.cookieHandler());

  // routers
  app.use(notificationRouter.PATH, notificationRouter.router);
  app.use(apartmentRouter.PATH, apartmentRouter.router);
  app.use(authRouter.PATH, authRouter.router);
  app.use(userRouter.PATH, userRouter.router);
  app.use(residentRouter.PATH, residentRouter.router);
  app.use(noticeRouter.PATH, noticeRouter.router);
  app.use(pollRouter.PATH, pollRouter.router);
  app.use(commentRouter.PATH, commentRouter.router);
  app.use(eventRouter.PATH, eventRouter.router);
  app.use(complaintRouter.PATH, complaintRouter.router);

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
    app,
  };
};
