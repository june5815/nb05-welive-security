import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IResidentController } from "./resident.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";

export interface IResidentRouter {
  router: Router;
  PATH: string;
}
export const ResidentRouter = (
  baseRouter: IBaseRouter,
  residentController: IResidentController,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
): IResidentRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/residents";

  router.get(
    "/:apartmentId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.getListHouseholdMembers),
  );

  router.get(
    "/:apartmentId/:householdMemberId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.getHouseholdMemberDetail),
  );

  return {
    router,
    PATH,
  };
};
