import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { IBaseRouter } from "../_base/base.router";
import { IBaseController } from "../_base/base.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";
import { CommentController } from "./comment.controller";
import { commentQueryRepository } from "../../_infra/repos/comment/comment-query.repo";
import { commentCommandRepository } from "../../_infra/repos/comment/comment-command.repo";
import { CommentQueryService } from "./services/comment-query.service";
import { CommentCommandService } from "./services/comment-command.service";

export interface ICommentRouter {
  router: Router;
  PATH: string;
}

export const CommentRouter = (
  baseRouter: IBaseRouter,
  baseController: IBaseController,
  prismaClient: PrismaClient,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
): ICommentRouter => {
  const { router, catchError } = baseRouter;
  const PATH = "/api/v2/comments";

  const queryRepo = commentQueryRepository(prismaClient);
  const commandRepo = commentCommandRepository(prismaClient);

  const queryService = CommentQueryService({ commentQueryRepo: queryRepo });
  const commandService = CommentCommandService({
    prisma: prismaClient,
    commentCommandRepo: commandRepo,
  });

  const controller = CommentController(
    baseController,
    queryService,
    commandService,
  );

  // 생성
  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.createComment),
  );

  // 목록
  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.getCommentList),
  );

  // 수정
  router.patch(
    "/:commentId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.updateComment),
  );

  // 삭제
  router.delete(
    "/:commentId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(controller.deleteComment),
  );

  return { router, PATH };
};
