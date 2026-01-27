import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";
import { INoticeController } from "./notice.controller";

export interface INoticeRouter {
  router: Router;
  PATH: string;
}

export const NoticeRouter = (
  baseRouter: IBaseRouter,
  noticeController: INoticeController,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
): INoticeRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/notices";

  /**
   * 목록 조회 (관리자/입주민)
   * GET /api/v2/notices?page&limit&category&searchKeyword
   */
  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(noticeController.getNoticeList),
  );

  /**
   * 상세 조회 (관리자/입주민)
   * GET /api/v2/notices/:noticeId
   */
  router.get(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(noticeController.getNoticeDetail),
  );

  /**
   * 공지 생성 (관리자)
   * POST /api/v2/notices
   */
  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(noticeController.createNotice),
  );

  /**
   * 공지 수정 (관리자)
   * PATCH /api/v2/notices/:noticeId
   */
  router.patch(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(noticeController.updateNotice),
  );

  /**
   * 공지 삭제 (관리자)
   * DELETE /api/v2/notices/:noticeId
   */
  router.delete(
    "/:noticeId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(noticeController.deleteNotice),
  );

  return { router, PATH };
};
