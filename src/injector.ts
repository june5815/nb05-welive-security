import { BaseRouter } from "./inbound/routers/base.router";
import { AuthRouter } from "./inbound/routers/auth.router";
import { UserRouter } from "./inbound/routers/user.router";

import { BaseController } from "./inbound/controllers/base.controller";
import { AuthController } from "./inbound/controllers/auth.controller";
import { UserController } from "./inbound/controllers/user.controller";

import { AuthCommandService } from "./application/command/services/auth-command.service";
import { UserCommandService } from "./application/command/services/user-command.service";
import { UserQueryService } from "./application/query/services/user-query.service";

import { BaseCommandRepo } from "./outbound/repos/command/base-command.repo";
import { UserCommandRepo } from "./outbound/repos/command/user-command.repo";
import { BaseQueryRepo } from "./outbound/repos/query/base-query.repo";
import { UserQueryRepo } from "./outbound/repos/query/user-query.repo";
import { UOW } from "./outbound/unit-of-work";
import { HashManager } from "./outbound/managers/bcrypt-hash.manager";
import { PrismaClient } from "@prisma/client";

import { ConfigUtil } from "./shared/utils/config.util";
import { TokenUtil } from "./shared/utils/token.util";

import { AuthMiddleware } from "./inbound/middlewares/auth.middleware";
import { CookieMiddleware } from "./inbound/middlewares/cookie.middleware";
import { CorsMiddleware } from "./inbound/middlewares/cors.middleware";
import { GlobalErrorMiddleware } from "./inbound/middlewares/global-error.middleware";
import { JsonMiddleware } from "./inbound/middlewares/json.middleware";
import { LoggerMiddleware } from "./inbound/middlewares/logger.middleware";
import { MulterMiddleware } from "./inbound/middlewares/multer.middleware";
import { NotFoundErrorMiddleware } from "./inbound/middlewares/not-found-error.middleware";
import { RoleMiddleware } from "./inbound/middlewares/role.middleware";
import { StaticServeMiddleware } from "./inbound/middlewares/static-serve.middleware";

import { HttpServer, IHttpServer } from "./inbound/servers/http-server";

export const Injector = () => {
  const configUtil = ConfigUtil();
  const tokenUtil = TokenUtil(configUtil);

  const prisma = new PrismaClient();
  const baseCommandRepo = BaseCommandRepo(prisma);
  const userCommandRepo = UserCommandRepo(baseCommandRepo);
  const baseQueryRepo = BaseQueryRepo(prisma);
  const userQueryRepo = UserQueryRepo(baseQueryRepo);

  const unitOfWork = UOW(prisma, configUtil);
  const hashManager = HashManager(configUtil);
  const authCommandService = AuthCommandService(
    unitOfWork,
    hashManager,
    tokenUtil,
    userCommandRepo,
  );
  const userCommandService = UserCommandService(
    unitOfWork,
    hashManager,
    userCommandRepo,
  );
  const userQueryService = UserQueryService(userQueryRepo);

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

  const baseRouter = BaseRouter();
  const authRouter = AuthRouter(baseRouter, authController);
  const userRouter = UserRouter(
    baseRouter,
    userController,
    authMiddleware,
    roleMiddleware,
    multerMiddleware,
  );

  const httpServer = HttpServer(
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
  );

  return {
    httpServer,
  };
};
