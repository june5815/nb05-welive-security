import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IAuthController } from "./auth.controller";

export interface IAuthRouter {
  router: Router;
  PATH: string;
}

export const AuthRouter = (
  baseRouter: IBaseRouter,
  authController: IAuthController,
): IAuthRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/auth";

  router.post("/login", catchError(authController.login));
  router.post("/logout", catchError(authController.logout));
  router.post("/refresh", catchError(authController.refreshToken));

  return {
    router,
    PATH,
  };
};
