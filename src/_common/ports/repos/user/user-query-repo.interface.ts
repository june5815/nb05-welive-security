import {
  ProfileView,
  AdminView,
  AdminListReq,
  AdminListResView,
  ResidentUserListReq,
  ResidentUserListResView,
} from "../../../../_modules/users/dtos/res/user.view";

export interface IUserQueryRepo {
  findAdminById: (adminId: string) => Promise<AdminView | null>;
  /**
   * @todo 현재는 SuperAdmin의 프로필을 조회하지 않는다.
   */
  getMyProfile: (userId: string) => Promise<ProfileView | null>;
  findAdminList: (query: AdminListReq) => Promise<AdminListResView>;
  findResidentUserList: (
    query: ResidentUserListReq,
    userId: string,
  ) => Promise<ResidentUserListResView>;
  findAllSuperAdmins: () => Promise<
    Array<{
      id: string;
      username: string;
      name: string;
      email: string;
    }>
  >;
  findApartmentById: (apartmentId: string) => Promise<any>;
}
