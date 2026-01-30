import { BaseRouter } from "./_modules/_base/base.router";
import { AuthRouter } from "./_modules/auth/auth.router";
import { UserRouter } from "./_modules/users/user.router";
import { ApartmentRouter } from "./_modules/apartments/apartment.router";
import { NoticeRouter } from "./_modules/notices/notice.routes";
import { CommentRouter } from "./_modules/comments/routes";
import { EventRouter } from "./_modules/events/routes";

import { BaseController } from "./_modules/_base/base.controller";
import { AuthController } from "./_modules/auth/auth.controller";
import { UserController } from "./_modules/users/user.controller";
import { ApartmentController } from "./_modules/apartments/apartment.controller";

import { AuthCommandService } from "./_modules/auth/service/auth-command.service";
import { UserCommandService } from "./_modules/users/service/user-command.service";
import { UserQueryService } from "./_modules/users/service/user-query.service";
import { ApartmentQueryUsecase } from "./_modules/apartments/usecases/query/apartment-query.usecase";

import { AuthCommandRepo } from "./_infra/repos/auth/auth-command.repo";
import { BaseCommandRepo } from "./_infra/repos/_base/base-command.repo";
import { UserCommandRepo } from "./_infra/repos/user/user-command.repo";
import { BaseQueryRepo } from "./_infra/repos/_base/base-query.repo";
import { UserQueryRepo } from "./_infra/repos/user/user-query.repo";
import { ApartmentQueryRepo } from "./_infra/repos/apartment/apartment-query.repo";

import { UOW } from "./_infra/db/unit-of-work";
import { HashManager } from "./_infra/manager/bcrypt-hash.manager";
import { PrismaClient } from "@prisma/client";

import { ConfigUtil } from "./_common/utils/config.util";
import { TokenUtil } from "./_common/utils/token.util";

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

import { HttpServer, IHttpServer } from "./_servers/http-server";

export const Injector = () => {
  const configUtil = ConfigUtil();
  const tokenUtil = TokenUtil(configUtil);

  const prisma = new PrismaClient();
  const baseCommandRepo = BaseCommandRepo(prisma);
  const authCommandRepo = AuthCommandRepo(baseCommandRepo);
  const userCommandRepo = UserCommandRepo(baseCommandRepo);
  const baseQueryRepo = BaseQueryRepo(prisma);
  const userQueryRepo = UserQueryRepo(baseQueryRepo);
  const apartmentQueryRepo = ApartmentQueryRepo(baseQueryRepo);

  const unitOfWork = UOW(prisma, configUtil);
  const hashManager = HashManager(configUtil);
  const authCommandService = AuthCommandService(
    unitOfWork,
    hashManager,
    tokenUtil,
    authCommandRepo,
    userCommandRepo,
  );
  const userCommandService = UserCommandService(
    unitOfWork,
    hashManager,
    userCommandRepo,
  );
  const userQueryService = UserQueryService(userQueryRepo);
  const apartmentQueryUsecase = ApartmentQueryUsecase(apartmentQueryRepo);

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

  const baseRouter = BaseRouter();
  const authRouter = AuthRouter(baseRouter, authController);
  const userRouter = UserRouter(
    baseRouter,
    userController,
    authMiddleware,
    roleMiddleware,
    multerMiddleware,
  );
  const apartmentRouter = ApartmentRouter(baseRouter, apartmentController);

  const noticeRouter = NoticeRouter(
    baseRouter,
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
  );

  const commentRouter = CommentRouter(
    baseRouter,
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
  );

  const eventRouter = EventRouter(
    baseRouter,
    baseController,
    prisma,
    authMiddleware,
    roleMiddleware,
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
    noticeRouter,
    commentRouter,
    eventRouter,
  );

  return {
    httpServer,
  };
};
