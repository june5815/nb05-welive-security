import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { IBaseRouter } from "../_base/base.router";
import { IBaseController } from "../_base/base.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";
import { NoticeController } from "./notice.controller";
import { noticeQueryRepository } from "../../_infra/repos/notice/notice-query.repo";
import { noticeCommandRepository } from "../../_infra/repos/notice/notice-command.repo";
import { NoticeQueryService } from "./service/notice-query.service";
import { NoticeCommandService } from "./service/notice-command.service";
import { INoticeNotificationUsecase } from "../../_common/ports/notification/notice-notification-usecase.interface";

export interface INoticeRouter {
  router: Router;
  PATH: string;
}

export const NoticeRouter = (
  baseRouter: IBaseRouter,
  baseController: IBaseController,
  prismaClient: PrismaClient,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
  noticeNotificationUsecase?: INoticeNotificationUsecase,
): INoticeRouter => {
  const router = Router();
  const { catchError } = baseRouter;
  const PATH = "/api/v2/notices";

  const queryRepo = noticeQueryRepository(prismaClient);
  const commandRepo = noticeCommandRepository(prismaClient);

  const queryService = NoticeQueryService({ noticeQueryRepo: queryRepo });
  const commandService = NoticeCommandService({
    prisma: prismaClient,
    noticeCommandRepo: commandRepo,
    noticeNotificationUsecase,
  });

  const controller = NoticeController(
    baseController,
    queryService,
    commandService,
  );

  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.getNoticeList),
  );

  router.get(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.getNoticeDetail),
  );

  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.createNotice),
  );

  router.patch(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.updateNotice),
  );

  router.delete(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.deleteNotice),
  );

  return { router, PATH };
};
