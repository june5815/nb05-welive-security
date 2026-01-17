import { IBaseController } from "./base.controller";
import { IUserQueryService } from "../../application/query/services/user-query.service";
import { IUserCommandService } from "../../application/command/services/user-command.service";
import { Request, Response } from "express";
import {
  createUserReqSchema,
  getMyProfileReqSchema,
  getAdminListReqSchema,
  getResidentUserListReqSchema,
  updateAvatarReqSchema,
  updatePasswordReqSchema,
  updateAdminDataReqSchema,
  updateUserSignUpStatusReqSchema,
  updateUserListSignUpStatusReqSchema,
  deleteAdminReqSchema,
} from "../req-dto-validate/user.request";

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

  // getMyProfile은 토큰에서 userId를 추출하여 사용하는 걸로 생각됨
  const getMyProfile = async (req: Request, res: Response) => {
    const reqDto = validate(getMyProfileReqSchema, { userId: req.userId });

    const userProfile = await userQueryService.getMyProfile(reqDto);

    res.status(200).json({ userProfile });
  };
  const getAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(getMyProfileReqSchema, { userId: req.userId });

    const adminData = await userQueryService.findAdminById(reqDto);

    res.status(200).json({ adminData });
  };
  const getAdminList = async (req: Request, res: Response) => {
    const reqDto = validate(getAdminListReqSchema, { query: req.query });

    const adminList = await userQueryService.getAdminList(reqDto);

    res.status(200).json({ adminList });
  };
  const getResidentUserList = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentUserListReqSchema, { query: req.query });

    const residentUserList = await userQueryService.getResidentUserList(reqDto);

    res.status(200).json({ residentUserList });
  };

  const signUpSuperAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    const newUser = await userCommandService.signUpSuperAdmin(reqDto);

    res.status(201).json({ newUser });
  };
  const signUpAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    const newUser = await userCommandService.signUpAdmin(reqDto);

    res.status(201).json({ newUser });
  };
  const signUpResidentUser = async (req: Request, res: Response) => {
    const reqDto = validate(createUserReqSchema, { body: req.body });

    const newUser = await userCommandService.signUpResidentUser(reqDto);

    res.status(201).json({ newUser });
  };

  // getMyProfile 작동 이후 토큰에서 userId를 추출하여 사용하는 걸로 생각됨
  const updateMyAvatar = async (req: Request, res: Response) => {
    const reqDto = validate(updateAvatarReqSchema, {
      userId: req.userId,
      file: req.file,
    });

    const updatedUser = await userCommandService.updateMyAvatar(reqDto);

    res.status(200).json({ updatedUser });
  };
  // getMyProfile 작동 이후 토큰에서 userId를 추출하여 사용하는 걸로 생각됨
  const updateMyPassword = async (req: Request, res: Response) => {
    const reqDto = validate(updatePasswordReqSchema, {
      userId: req.userId,
      body: req.body,
    });

    const updatedUser = await userCommandService.updateMyPassword(reqDto);

    res.status(200).json({ updatedUser });
  };
  const updateAdminData = async (req: Request, res: Response) => {
    const reqDto = validate(updateAdminDataReqSchema, {
      userId: req.userId,
      body: req.body,
    });

    const updatedUser = await userCommandService.updateAdminData(reqDto);

    res.status(200).json({ updatedUser });
  };

  const updateAdminSignUpStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateUserSignUpStatusReqSchema, {
      userId: req.userId,
      body: req.body,
    });

    const updatedUser =
      await userCommandService.updateAdminSignUpStatus(reqDto);

    res.status(200).json({ updatedUser });
  };
  const updateAdminListSignUpStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateUserListSignUpStatusReqSchema, {
      body: req.body,
    });

    await userCommandService.updateAdminListSignUpStatus(reqDto);

    res.status(200).json();
  };
  const updateResidentUserSignUpStatus = async (
    req: Request,
    res: Response,
  ) => {
    const reqDto = validate(updateUserSignUpStatusReqSchema, {
      userId: req.userId,
      body: req.body,
    });

    const updatedUser =
      await userCommandService.updateResidentUserSignUpStatus(reqDto);

    res.status(200).json({ updatedUser });
  };
  const updateResidentUserListSignUpStatus = async (
    req: Request,
    res: Response,
  ) => {
    const reqDto = validate(updateUserListSignUpStatusReqSchema, {
      body: req.body,
    });

    await userCommandService.updateResidentUserListSignUpStatus(reqDto);

    res.status(200).json();
  };

  const deleteAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(deleteAdminReqSchema, {
      userId: req.userId,
    });

    await userCommandService.deleteAdmin(reqDto);

    res.status(200).json();
  };
  const deleteRejectedAdmins = async (req: Request, res: Response) => {
    await userCommandService.deleteRejectedAdmins();

    res.status(200).json();
  };
  const deleteRejectedResidentUsers = async (req: Request, res: Response) => {
    await userCommandService.deleteRejectedResidentUsers();

    res.status(200).json();
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
