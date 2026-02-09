import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IComplaintController } from "./complaint.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";

export interface IComplaintRouter {
  router: Router;
  PATH: string;
}

export const ComplaintRouter = (
  baseRouter: IBaseRouter,
  controller: IComplaintController,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
): IComplaintRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/complaints";

  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["USER"]),
    catchError(controller.create),
  );
  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["USER", "ADMIN"]),
    catchError(controller.list),
  );
  router.get(
    "/:complaintId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["USER", "ADMIN"]),
    catchError(controller.detail),
  );
  router.patch(
    "/:complaintId/status",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(controller.updateStatus),
  );

  return { router, PATH };
};
