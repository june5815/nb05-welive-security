import { BaseRouter } from "./_modules/_base/base.router";
import { AuthRouter } from "./_modules/auth/auth.router";
import { UserRouter } from "./_modules/users/user.router";
import { ApartmentRouter } from "./_modules/apartments/apartment.router";
import { NoticeRouter } from "./_modules/notices/notice.routes";
import { CommentRouter } from "./_modules/comments/routes";
import { EventRouter } from "./_modules/events/routes";
import { ResidentRouter } from "./_modules/residents/resident.router";
import { NotificationRouter } from "./_modules/notification/notification.router";
import { createNotificationScheduler } from "./_modules/notification/notification-scheulder";
import { NotificationSchedulerService } from "./_modules/notification/infrastructure/notification-scheduler.service";
import { NotificationSSEManagerService } from "./_modules/notification/infrastructure/notification-sse-manager.service";

import { BaseController } from "./_modules/_base/base.controller";
import { AuthController } from "./_modules/auth/auth.controller";
import { UserController } from "./_modules/users/user.controller";
import { ApartmentController } from "./_modules/apartments/apartment.controller";
import { createResidentController } from "./_modules/residents/resident.controller";
import { NotificationController } from "./_modules/notification/notification.controller";

import { AuthCommandService } from "./_modules/auth/service/auth-command.service";
import { UserCommandService } from "./_modules/users/service/user-command.service";
import { UserQueryService } from "./_modules/users/service/user-query.service";
import { ApartmentQueryUsecase } from "./_modules/apartments/usecases/query/apartment-query.usecase";
import { ResidentCommandService } from "./_modules/residents/usecases/resident-command.usecase";
import { ResidentQueryService } from "./_modules/residents/usecases/resident-query.usecase";
import { NotificationQueryUsecase } from "./_modules/notification/usecases/notification-query.usecase";
import { NotificationCommandUsecase } from "./_modules/notification/usecases/notification-command.usecase";
import { SendNotificationUsecase } from "./_modules/notification/usecases/send-notification.usecase";
import { NoticeNotificationUsecase } from "./_modules/notification/usecases/notice-notification.usecase";
import { NotificationEventManager } from "./_modules/notification/infrastructure/notification-event-manager";

// import { AuthCommandRepo } from "./_infra/repos/auth/auth-command.repo";
import { BaseCommandRepo } from "./_infra/repos/_base/base-command.repo";
import { UserCommandRepo } from "./_infra/repos/user/user-command.repo";
import { BaseQueryRepo } from "./_infra/repos/_base/base-query.repo";
import { UserQueryRepo } from "./_infra/repos/user/user-query.repo";
import { ApartmentQueryRepo } from "./_infra/repos/apartment/apartment-query.repo";
import { ResidentCommandRepository } from "./_infra/repos/resident/resident-command.repo";
import { ResidentQueryRepository } from "./_infra/repos/resident/resident-query.repo";
import { NotificationQueryRepo } from "./_infra/repos/notification/notification-query.repo";
import { NotificationCommandRepo } from "./_infra/repos/notification/notification-command.repo";
import { RedisExternal } from "./_infra/externals/redis.external";

import { UOW } from "./_infra/db/unit-of-work";
import { HashManager } from "./_infra/manager/bcrypt-hash.manager";
import { PrismaClient } from "@prisma/client";

import { ConfigUtil } from "./_common/utils/config.util";
import { TokenUtil } from "./_common/utils/token.util";
import { toNoticeResponse } from "./_infra/mappers/notice.mapper";

import { AuthMiddleware } from "./_common/middlewares/auth.middleware";
import { CookieMiddleware } from "./_common/middlewares/cookie.middleware";
import { CorsMiddleware } from "./_common/middlewares/cors.middleware";
import { GlobalErrorMiddleware } from "./_common/middlewares/global-error.middleware";
import { JsonMiddleware } from "./_common/middlewares/json.middleware";
import { LoggerMiddleware } from "./_common/middlewares/logger.middleware";
import { MulterMiddleware } from "./_common/middlewares/multer.middleware";
import { NotFoundErrorMiddleware } from "./_common/middlewares/not-found-error.middleware";
import { RoleMiddleware } from "./_common/middlewares/role.middleware";
import { StaticServeMiddleware } from "./_common/middlewares/static-serve.middleware";

import { HttpServer, IHttpServer } from "./servers/http-server";

export const Injector = () => {
  const configUtil = ConfigUtil();
  const tokenUtil = TokenUtil(configUtil);

  const prisma = new PrismaClient();
  const baseCommandRepo = BaseCommandRepo(prisma);
  // const authCommandRepo = AuthCommandRepo(baseCommandRepo);
  const userCommandRepo = UserCommandRepo(baseCommandRepo);
  const residentCommandRepo = ResidentCommandRepository(baseCommandRepo);
  const baseQueryRepo = BaseQueryRepo(prisma);
  const userQueryRepo = UserQueryRepo(baseQueryRepo);
  const apartmentQueryRepo = ApartmentQueryRepo(baseQueryRepo);
  const residentQueryRepo = ResidentQueryRepository(baseQueryRepo);
  const notificationQueryRepo = NotificationQueryRepo(prisma);
  const notificationCommandRepo = NotificationCommandRepo(prisma);

  const redisExternal = RedisExternal(configUtil);
  const unitOfWork = UOW(prisma, configUtil);
  const hashManager = HashManager(configUtil);

  const sendNotificationUsecase = SendNotificationUsecase(
    notificationCommandRepo,
  );

  const authCommandService = AuthCommandService(
    unitOfWork,
    hashManager,
    tokenUtil,
    // authCommandRepo,
    redisExternal,
    userCommandRepo,
  );

  const userQueryService = UserQueryService(userQueryRepo);
  const notificationQueryUsecase = NotificationQueryUsecase(
    notificationQueryRepo,
  );
  const notificationCommandUsecase = NotificationCommandUsecase(
    notificationCommandRepo,
    userQueryRepo,
  );

  const userCommandService = UserCommandService(
    unitOfWork,
    hashManager,
    userCommandRepo,
    notificationCommandUsecase,
  );
  const apartmentQueryUsecase = ApartmentQueryUsecase(apartmentQueryRepo);
  const residentCommandService = ResidentCommandService(
    residentCommandRepo,
    residentQueryRepo,
  );
  const residentQueryService = ResidentQueryService(residentQueryRepo);
  const notificationEventManager = NotificationEventManager(prisma);
  const noticeNotificationUsecase = NoticeNotificationUsecase(
    notificationEventManager,
  );

  const authMiddleware = AuthMiddleware(tokenUtil);
  const cookieMiddleware = CookieMiddleware(configUtil);
  const corsMiddleware = CorsMiddleware(configUtil);
  const globalErrorMiddleware = GlobalErrorMiddleware(configUtil);
  const jsonMiddleware = JsonMiddleware(configUtil);
  const loggerMiddleware = LoggerMiddleware(configUtil);
  const multerMiddleware = MulterMiddleware(configUtil);
  const notFoundErrorMiddleware = NotFoundErrorMiddleware();
  const roleMiddleware = RoleMiddleware();
  const staticServeMiddleware = StaticServeMiddleware(configUtil);

  const baseController = BaseController();
  const authController = AuthController(baseController, authCommandService);
  const userController = UserController(
    baseController,
    userQueryService,
    userCommandService,
  );
  const apartmentController = ApartmentController(
    baseController,
    apartmentQueryUsecase,
  );
  const residentController = createResidentController(
    residentCommandService,
    residentQueryService,
  );
  const notificationController = NotificationController(
    baseController,
    notificationQueryUsecase,
    notificationCommandUsecase,
    NotificationSSEManagerService(prisma),
  );

  const baseRouter = BaseRouter();
  const authRouter = AuthRouter(BaseRouter(), authController);
  const userRouter = UserRouter(
    BaseRouter(),
    userController,
    authMiddleware,
    roleMiddleware,
    multerMiddleware,
  );
  const apartmentRouter = ApartmentRouter(BaseRouter(), apartmentController);
  const residentRouter = ResidentRouter(
    BaseRouter(),
    residentController,
    authMiddleware,
    roleMiddleware,
  );

  const noticeRouter = NoticeRouter(
    BaseRouter(),
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
    noticeNotificationUsecase,
  );

  const commentRouter = CommentRouter(
    BaseRouter(),
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
  );

  const eventRouter = EventRouter(
    BaseRouter(),
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
  );

  const notificationRouter = NotificationRouter(
    BaseRouter(),
    notificationController,
    authMiddleware,
  );

  const notificationScheduler = createNotificationScheduler(
    NotificationSchedulerService(prisma),
  );

  const httpServer: IHttpServer = HttpServer(
    configUtil,
    cookieMiddleware,
    corsMiddleware,
    globalErrorMiddleware,
    jsonMiddleware,
    loggerMiddleware,
    notFoundErrorMiddleware,
    staticServeMiddleware,
    authRouter,
    userRouter,
    apartmentRouter,
    residentRouter,
    noticeRouter,
    commentRouter,
    eventRouter,
    notificationRouter,
  );

  return {
    httpServer,
    notificationScheduler,
  };
};
