import { Router } from "express";
import multer from "multer";
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
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  router.post(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.createResidentHouseholdMember),
  );

  router.get(
    "/file/template",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.downloadResidentTemplate),
  );

  router.post(
    "/file/import",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    upload.single("file"),
    catchError(residentController.importResidentsFromFile),
  );

  router.get(
    "/file/export",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.exportResidentsToFile),
  );

  router.get(
    "/:id",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.getHouseholdMemberDetail),
  );

  router.patch(
    "/:id",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.updateResidentHouseholdMember),
  );

  router.delete(
    "/:id",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.deleteResidentHouseholdMember),
  );

  router.get(
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.getListHouseholdMembers),
  );

  return {
    router,
    PATH,
  };
};
