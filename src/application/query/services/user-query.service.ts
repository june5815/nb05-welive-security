import {
  JoinStatus,
  ProfileView,
  AdminView,
  AdminListReq,
  AdminItemView,
  AdminListResView,
  ResidentUserListReq,
  ResidentItemView,
  ResidentUserListResView,
} from "../views/user.view";
import { IUserQueryRepo } from "../../ports/repos/query/user-query-repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";

export const UserQueryService = (userQueryRepo: IUserQueryRepo) => {
  const getMyProfile = async () => {};

  const getAdminList = async () => {};

  const getResidentUserList = async () => {};

  return {
    getMyProfile,
    getAdminList,
    getResidentUserList,
  };
};
