import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { INotificationController } from "./notification.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";

export interface INotificationRouter {
  router: Router;
  PATH: string;
}
export const NotificationRouter = (
  baseRouter: IBaseRouter,
  notificationController: INotificationController,
  authMiddleware: IAuthMiddleware,
): INotificationRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/notifications";

  router.get(
    "/sse",
    authMiddleware.checkAuth,
    catchError(notificationController.getUnreadNotificationsSse),
  );

  router.get(
    "/",
    authMiddleware.checkAuth,
    catchError(notificationController.getNotificationList),
  );

  router.patch(
    "/:notificationReceiptId/read",
    authMiddleware.checkAuth,
    catchError(notificationController.markNotificationAsRead),
  );

  return {
    router,
    PATH,
  };
};
export type NotificationRouterService = ReturnType<typeof NotificationRouter>;
