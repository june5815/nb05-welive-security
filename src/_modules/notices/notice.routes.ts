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
): INoticeRouter => {
  const { router, catchError } = baseRouter;
  const PATH = "/api/v2/notices";

  const queryRepo = noticeQueryRepository(prismaClient);
  const commandRepo = noticeCommandRepository(prismaClient);

  const queryService = NoticeQueryService({ noticeQueryRepo: queryRepo });
  const commandService = NoticeCommandService({
    prisma: prismaClient,
    noticeCommandRepo: commandRepo,
  });

  const controller = NoticeController(
    baseController,
    queryService,
    commandService,
  );

  /**
   * 목록 조회 (관리자/입주민)
   * GET /api/v2/notices
   */
  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.getNoticeList),
  );

  /**
   * 상세 조회 (관리자/입주민)
   * GET /api/v2/notices/:noticeId
   */
  router.get(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.getNoticeDetail),
  );

  /**
   * 공지 생성 (관리자)
   * POST /api/v2/notices
   */
  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.createNotice),
  );

  /**
   * 공지 수정 (관리자)
   * PATCH /api/v2/notices/:noticeId
   */
  router.patch(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.updateNotice),
  );

  /**
   * 공지 삭제 (관리자)
   * DELETE /api/v2/notices/:noticeId
   */
  router.delete(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.deleteNotice),
  );

  return { router, PATH };
};
