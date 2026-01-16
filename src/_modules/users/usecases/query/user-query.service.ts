import {
  getMyProfileReqDTO,
  getAdminListReqDTO,
  getResidentUserListReqDTO,
} from "../../../_modules/users/dtos/user.request";
import {
  ProfileView,
  AdminView,
  AdminListResView,
  ResidentUserListResView,
} from "../views/user.view";
import { IUserQueryRepo } from "../../../_common/ports/repos/user/user-query-repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";

export const UserQueryService = (userQueryRepo: IUserQueryRepo) => {
  const findAdminById = async (dto: getMyProfileReqDTO): Promise<AdminView> => {
    const admin = await userQueryRepo.findAdminById(dto.userId);
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
    const profile = await userQueryRepo.getMyProfile(dto.userId);
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
    const { query } = dto;

    const adminListRes = await userQueryRepo.findAdminList(query);

    return adminListRes;
  };

  const getResidentUserList = async (
    dto: getResidentUserListReqDTO,
  ): Promise<ResidentUserListResView> => {
    const { query } = dto;

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
