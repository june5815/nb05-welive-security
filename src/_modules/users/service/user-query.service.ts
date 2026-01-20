import {
  getMyProfileReqDTO,
  getAdminReqDTO,
  getAdminListReqDTO,
  getResidentUserListReqDTO,
} from "../dtos/req/user.request";
import {
  ProfileView,
  AdminView,
  AdminListResView,
  ResidentUserListResView,
} from "../dtos/res/user.view";
import { IUserQueryRepo } from "../../../_common/ports/repos/user/user-query-repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export interface IUserQueryService {
  getMyProfile: (dto: getMyProfileReqDTO) => Promise<ProfileView>;
  findAdminById: (dto: getAdminReqDTO) => Promise<AdminView>;
  getAdminList: (dto: getAdminListReqDTO) => Promise<AdminListResView>;
  getResidentUserList: (
    dto: getResidentUserListReqDTO,
  ) => Promise<ResidentUserListResView>;
}

export const UserQueryService = (
  userQueryRepo: IUserQueryRepo,
): IUserQueryService => {
  const findAdminById = async (dto: getAdminReqDTO): Promise<AdminView> => {
    const { userId, role, params } = dto;

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }
    if (role !== "SUPER_ADMIN") {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    const admin = await userQueryRepo.findAdminById(params.adminId);
    if (!admin) {
      throw new BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return admin;
  };

  const getMyProfile = async (
    dto: getMyProfileReqDTO,
  ): Promise<ProfileView> => {
    const { userId, role } = dto;

    let profile: ProfileView | null;
    if (role === "ADMIN" || role === "USER") {
      profile = await userQueryRepo.getMyProfile(userId);
    } else {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    if (!profile) {
      throw new BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return profile;
  };

  const getAdminList = async (
    dto: getAdminListReqDTO,
  ): Promise<AdminListResView> => {
    const { userId, role, query } = dto;

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }
    if (role !== "SUPER_ADMIN") {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    const adminListRes = await userQueryRepo.findAdminList(query);

    return adminListRes;
  };

  const getResidentUserList = async (
    dto: getResidentUserListReqDTO,
  ): Promise<ResidentUserListResView> => {
    const { userId, role, query } = dto;

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }
    if (role !== "ADMIN") {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    const residentUserListRes = await userQueryRepo.findResidentUserList(query);

    return residentUserListRes;
  };

  return {
    findAdminById,
    getMyProfile,
    getAdminList,
    getResidentUserList,
  };
};
