import { IBaseRouter } from "./base.router";
import { IUserController } from "../controllers/user.controller";
import { IAuthMiddleware } from "../middlewares/auth.middleware";
import { IMulterMiddleware } from "../middlewares/multer.middleware";

export const UserRouter = (
  baseRouter: IBaseRouter,
  userController: IUserController,
  authMiddleware: IAuthMiddleware,
  multerMiddleware: IMulterMiddleware,
) => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/users";

  // 조회
  router.get(
    "/me",
    authMiddleware.checkAuth,
    catchError(userController.getMyProfile),
  );
  router.get(
    "/admins",
    authMiddleware.checkAuth,
    catchError(userController.getAdminList),
  );
  router.get(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    catchError(userController.getAdmin),
  );
  router.get(
    "/residents",
    authMiddleware.checkAuth,
    catchError(userController.getResidentUserList),
  );

  // 생성
  router.post("/super-admins", catchError(userController.signUpSuperAdmin));
  router.post(
    "/admins",
    authMiddleware.checkAuth,
    catchError(userController.signUpAdmin),
  );
  router.post(
    "/residents",
    authMiddleware.checkAuth,
    catchError(userController.signUpResidentUser),
  );

  // 수정
  router.patch(
    "/me/avatar",
    authMiddleware.checkAuth,
    multerMiddleware.uploadSingle(),
    catchError(userController.updateMyAvatar),
  );
  router.patch(
    "/me/password",
    authMiddleware.checkAuth,
    catchError(userController.updateMyPassword),
  );

  // 가입 상태 변경
  router.patch(
    "/admins/join-status",
    authMiddleware.checkAuth,
    catchError(userController.updateAdminListSignUpStatus),
  );
  router.patch(
    "/admins/:adminId/join-status",
    authMiddleware.checkAuth,
    catchError(userController.updateAdminSignUpStatus),
  );
  router.patch(
    "/residents/join-status",
    authMiddleware.checkAuth,
    catchError(userController.updateResidentUserListSignUpStatus),
  );
  router.patch(
    "/residents/:residentId/join-status",
    authMiddleware.checkAuth,
    catchError(userController.updateResidentUserSignUpStatus),
  );

  // 관리자 정보 수정
  router.patch(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    catchError(userController.updateAdminData),
  );

  // 삭제
  router.delete(
    "/admins/rejected",
    authMiddleware.checkAuth,
    catchError(userController.deleteRejectedAdmins),
  );
  router.delete(
    "/admins/:adminId",
    authMiddleware.checkAuth,
    catchError(userController.deleteAdmin),
  );
  router.delete(
    "/residents/rejected",
    authMiddleware.checkAuth,
    catchError(userController.deleteRejectedResidentUsers),
  );

  return {
    router,
    PATH,
  };
};
