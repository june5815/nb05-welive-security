import {
  getMyProfileReqDTO,
  getAdminReqDTO,
  getAdminListReqDTO,
  getResidentUserListReqDTO,
} from "../../../inbound/req-dto-validate/user.request";
import {
  ProfileView,
  AdminView,
  AdminListResView,
  ResidentUserListResView,
} from "../views/user.view";
import { IUserQueryRepo } from "../../ports/repos/query/user-query-repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";

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
    const admin = await userQueryRepo.findAdminById(dto.params.adminId);
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
