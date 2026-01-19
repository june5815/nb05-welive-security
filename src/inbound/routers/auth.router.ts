import { Router } from "express";
import { IBaseRouter } from "./base.router";
import { IAuthController } from "../controllers/auth.controller";

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
