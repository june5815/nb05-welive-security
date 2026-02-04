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
    "/",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(residentController.getListHouseholdMembers),
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

  // household
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

  return {
    router,
    PATH,
  };
};
// [-]POST /residents - 입주민등록(관리자)-household member
// [-]GET /residents - 입주민 목록 조회
// [-]GET /:id - 입주민 상세조회(관리자)
// [-]PATCH /:id - 입주민 정보 수정(관리자)
// [-]DELETE /:id - 입주민 정보 삭제(관리자)
// [-]GET /file/template - 입주민 업로드 템플릿 다운로드(관리자)
// [-]POST /file/import - 파일로부터 입주민 리소스 생성(관리자)
// []GET /file/export - 입주민 목록 파일 다운로드(관리자)
