import {
  ProfileView,
  AdminView,
  AdminListReq,
  AdminListResView,
  ResidentUserListReq,
  ResidentUserListResView,
} from "../../../query/views/user.view";

export interface IUserQueryRepo {
  findAdminById: (userId: string) => Promise<AdminView | null>;
  getMyProfile: (userId: string) => Promise<ProfileView | null>;
  findAdminList: (query: AdminListReq) => Promise<AdminListResView>;
  findResidentUserList: (
    query: ResidentUserListReq,
  ) => Promise<ResidentUserListResView>;
}
