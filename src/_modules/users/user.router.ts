import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IUserController } from "./user.controller";
import { IAuthMiddleware } from "../../_common/ports/middlewares/auth-middleware.interface";
import { IRoleMiddleware } from "../../_common/ports/middlewares/role-middleware.interface";
import { IMulterMiddleware } from "../../_common/ports/middlewares/multer-middleware.interface";

export interface IUserRouter {
  router: Router;
  PATH: string;
}

export const UserRouter = (
  baseRouter: IBaseRouter,
  userController: IUserController,
  authMiddleware: IAuthMiddleware,
  roleMiddleware: IRoleMiddleware,
  multerMiddleware: IMulterMiddleware,
): IUserRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/users";

  // 조회
  router.get(
    "/me",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(userController.getMyProfile),
  );
  router.get(
    "/admins",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.getAdminList),
  );
  router.get(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.getAdmin),
  );
  router.get(
    "/residents",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(userController.getResidentUserList),
  );

  // 생성
  router.post("/super-admins", catchError(userController.signUpSuperAdmin));
  router.post("/admins", catchError(userController.signUpAdmin));
  router.post("/residents", catchError(userController.signUpResidentUser));

  // 수정
  router.patch(
    "/me/avatar",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    multerMiddleware.uploadSingle(),
    catchError(userController.updateMyAvatar),
  );
  router.patch(
    "/me/password",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN", "USER"]),
    catchError(userController.updateMyPassword),
  );

  // 가입 상태 변경
  router.patch(
    "/admins/join-status",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.updateAdminListSignUpStatus),
  );
  router.patch(
    "/admins/:adminId/join-status",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.updateAdminSignUpStatus),
  );
  router.patch(
    "/residents/join-status",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(userController.updateResidentUserListSignUpStatus),
  );
  router.patch(
    "/residents/:residentId/join-status",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(userController.updateResidentUserSignUpStatus),
  );

  // 관리자 정보 수정
  router.patch(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.updateAdminData),
  );

  // 삭제
  router.delete(
    "/admins/rejected",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.deleteRejectedAdmins),
  );
  router.delete(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["SUPER_ADMIN"]),
    catchError(userController.deleteAdmin),
  );
  router.delete(
    "/residents/rejected",
    authMiddleware.checkAuth,
    roleMiddleware.hasRole(["ADMIN"]),
    catchError(userController.deleteRejectedResidentUsers),
  );

  return {
    router,
    PATH,
  };
};
