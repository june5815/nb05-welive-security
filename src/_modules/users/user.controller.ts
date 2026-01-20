import { IBaseController } from "../_base/base.controller";
import { IUserQueryService } from "./service/user-query.service";
import { IUserCommandService } from "./service/user-command.service";
import { Request, Response } from "express";
import {
  createUserReqSchema,
  getMyProfileReqSchema,
  getAdminReqSchema,
  getAdminListReqSchema,
  getResidentUserListReqSchema,
  updateAvatarReqSchema,
  updatePasswordReqSchema,
  updateAdminDataReqSchema,
  updateUserSignUpStatusReqSchema,
  updateUserListSignUpStatusReqSchema,
  deleteAdminReqSchema,
  deleteRejectedUsersReqSchema,
} from "./dtos/req/user.request";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";

export interface IUserController {
  getMyProfile: (req: Request, res: Response) => Promise<void>;
  getAdmin: (req: Request, res: Response) => Promise<void>;
  getAdminList: (req: Request, res: Response) => Promise<void>;
  getResidentUserList: (req: Request, res: Response) => Promise<void>;
  signUpSuperAdmin: (req: Request, res: Response) => Promise<void>;
  signUpAdmin: (req: Request, res: Response) => Promise<void>;
  signUpResidentUser: (req: Request, res: Response) => Promise<void>;
  updateMyAvatar: (req: Request, res: Response) => Promise<void>;
  updateMyPassword: (req: Request, res: Response) => Promise<void>;
  updateAdminData: (req: Request, res: Response) => Promise<void>;
  updateAdminSignUpStatus: (req: Request, res: Response) => Promise<void>;
  updateAdminListSignUpStatus: (req: Request, res: Response) => Promise<void>;
  updateResidentUserSignUpStatus: (
    req: Request,
    res: Response,
  ) => Promise<void>;
  updateResidentUserListSignUpStatus: (
    req: Request,
    res: Response,
  ) => Promise<void>;
  deleteAdmin: (req: Request, res: Response) => Promise<void>;
  deleteRejectedAdmins: (req: Request, res: Response) => Promise<void>;
  deleteRejectedResidentUsers: (req: Request, res: Response) => Promise<void>;
}

export const UserController = (
  baseController: IBaseController,
  userQueryService: IUserQueryService,
  userCommandService: IUserCommandService,
): IUserController => {
  const validate = baseController.validate;

  // 조회
  const getMyProfile = async (req: Request, res: Response) => {
    const reqDto = validate(getMyProfileReqSchema, {
      userId: req.userId,
      role: req.userRole,
    });

    const userProfile = await userQueryService.getMyProfile(reqDto);

    res.status(200).json(userProfile);
  };
  const getAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(getAdminReqSchema, {
      userId: req.userId,
      role: req.userRole,
      params: req.params,
    });

    const adminData = await userQueryService.findAdminById(reqDto);

    res.status(200).json(adminData);
  };
  const getAdminList = async (req: Request, res: Response) => {
    const reqDto = validate(getAdminListReqSchema, {
      userId: req.userId,
      role: req.userRole,
      query: req.query,
    });

    const adminList = await userQueryService.getAdminList(reqDto);

    res.status(200).json(adminList);
  };
  const getResidentUserList = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentUserListReqSchema, {
      userId: req.userId,
      role: req.userRole,
      query: req.query,
    });

    const residentUserList = await userQueryService.getResidentUserList(reqDto);

    res.status(200).json(residentUserList);
  };

  // 생성
  const signUpSuperAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    await userCommandService.signUpSuperAdmin(reqDto);

    res.status(204).json();
  };
  const signUpAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    await userCommandService.signUpAdmin(reqDto);

    res.status(204).json();
  };
  const signUpResidentUser = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    await userCommandService.signUpResidentUser(reqDto);

    res.status(204).json();
  };

  // 수정
  const updateMyAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BusinessException({
        type: BusinessExceptionType.IMAGE_NOT_FOUND,
      });
    }

    const reqDto = validate(updateAvatarReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: { avatarImage: req.file },
    });

    await userCommandService.updateMyAvatar(reqDto);

    res.status(204).json();
  };
  const updateMyPassword = async (req: Request, res: Response) => {
    const reqDto = validate(updatePasswordReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
    });

    await userCommandService.updateMyPassword(reqDto);

    res.status(204).json();
  };
  const updateAdminData = async (req: Request, res: Response) => {
    const reqDto = validate(updateAdminDataReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
      params: req.params,
    });

    await userCommandService.updateAdminData(reqDto);

    res.status(204).json();
  };

  // 개별 승인 및 거절 or 일괄 승인 및 거절
  const updateAdminSignUpStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateUserSignUpStatusReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
      params: req.params,
    });

    await userCommandService.updateAdminSignUpStatus(reqDto);

    res.status(204).json();
  };
  const updateAdminListSignUpStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateUserListSignUpStatusReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
    });

    await userCommandService.updateAdminListSignUpStatus(reqDto);

    res.status(204).json();
  };
  const updateResidentUserSignUpStatus = async (
    req: Request,
    res: Response,
  ) => {
    const reqDto = validate(updateUserSignUpStatusReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
      params: req.params,
    });

    await userCommandService.updateResidentUserSignUpStatus(reqDto);

    res.status(204).json();
  };
  const updateResidentUserListSignUpStatus = async (
    req: Request,
    res: Response,
  ) => {
    const reqDto = validate(updateUserListSignUpStatusReqSchema, {
      userId: req.userId,
      role: req.userRole,
      body: req.body,
    });

    await userCommandService.updateResidentUserListSignUpStatus(reqDto);

    res.status(204).json();
  };

  // 삭제
  const deleteAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(deleteAdminReqSchema, {
      userId: req.userId,
      role: req.userRole,
      params: req.params,
    });

    await userCommandService.deleteAdmin(reqDto);

    res.status(204).json();
  };
  const deleteRejectedAdmins = async (req: Request, res: Response) => {
    const reqDto = validate(deleteRejectedUsersReqSchema, {
      userId: req.userId,
      role: req.userRole,
    });

    await userCommandService.deleteRejectedAdmins(reqDto);

    res.status(204).json();
  };
  const deleteRejectedResidentUsers = async (req: Request, res: Response) => {
    const reqDto = validate(deleteRejectedUsersReqSchema, {
      userId: req.userId,
      role: req.userRole,
    });

    await userCommandService.deleteRejectedResidentUsers(reqDto);

    res.status(204).json();
  };

  return {
    getMyProfile,
    getAdmin,
    getAdminList,
    getResidentUserList,
    signUpSuperAdmin,
    signUpAdmin,
    signUpResidentUser,
    updateMyAvatar,
    updateMyPassword,
    updateAdminData,
    updateAdminSignUpStatus,
    updateAdminListSignUpStatus,
    updateResidentUserSignUpStatus,
    updateResidentUserListSignUpStatus,
    deleteAdmin,
    deleteRejectedAdmins,
    deleteRejectedResidentUsers,
  };
};
