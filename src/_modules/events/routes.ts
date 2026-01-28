import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { IBaseRouter } from "../_base/base.router";
import { IBaseController } from "../_base/base.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";

import { eventQueryRepository } from "../../_infra/repos/event/event-query.repo";
import { EventController } from "./controller";
import { EventQueryService } from "./service/event-query.service";

export interface IEventRouter {
  router: Router;
  PATH: string;
}

export const EventRouter = (
  baseRouter: IBaseRouter,
  baseController: IBaseController,
  prismaClient: PrismaClient,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
): IEventRouter => {
  const { router, catchError } = baseRouter;
  const PATH = "/api/v2/events";

  const queryRepo = eventQueryRepository(prismaClient);

  const queryService = EventQueryService({ eventQueryRepo: queryRepo });

  const controller = EventController(baseController, queryService);

  // 이벤트 목록 조회 (GET /api/v2/events)
  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]), // 입주민, 관리자 모두 조회 가능
    catchError(controller.getEventList),
  );

  return { router, PATH };
};
