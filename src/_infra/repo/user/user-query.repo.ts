import {
  ProfileView,
  AdminView,
  AdminListReq,
  AdminListResView,
  ResidentUserListReq,
  ResidentUserListResView,
} from "../../../application/query/views/user.view";
import { IUserQueryRepo } from "../../../_common/ports/repos/user/user-query-repo.interface";
import { IBaseQueryRepo } from "../../../_infra/repo/base/base-query.repo";
import { Prisma, UserRole } from "@prisma/client";

export const UserQueryRepo = (
  baseQueryRepo: IBaseQueryRepo,
): IUserQueryRepo => {
  const findAdminById = async (userId: string): Promise<AdminView | null> => {
    try {
      const prismaClient = baseQueryRepo.getPrismaClient();
      const user = await prismaClient.user.findUnique({
        where: { id: userId, role: "ADMIN" },
        include: {
          adminOf: true,
        },
      });

      if (!user || !user.adminOf) {
        return null;
      }

      return {
        email: user.email,
        contact: user.contact,
        name: user.name,
        adminOf: {
          name: user.adminOf.name,
          address: user.adminOf.address,
          description: user.adminOf.description,
          officeNumber: user.adminOf.officeNumber,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  /**
   * @todo 현재는 SuperAdmin의 프로필을 조회하지 않는다.
   */
  const getMyProfile = async (userId: string): Promise<ProfileView | null> => {
    try {
      const prismaClient = baseQueryRepo.getPrismaClient();
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        contact: user.contact,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
      };
    } catch (error) {
      throw error;
    }
  };

  const findAdminList = async (
    query: AdminListReq,
  ): Promise<AdminListResView> => {
    try {
      const prismaClient = baseQueryRepo.getPrismaClient();
      const { page, limit, searchKeyword, joinStatus } = query;

      const whereCondition: Prisma.UserWhereInput = { role: UserRole.ADMIN };

      if (joinStatus) {
        whereCondition.joinStatus = joinStatus;
      }

      // 검색어 (관리자 정보(이름, 이메일), 아파트 정보(이름, 주소))
      if (searchKeyword) {
        const queryMode: Prisma.QueryMode = "insensitive";
        whereCondition.OR = [
          { name: { contains: searchKeyword, mode: queryMode } },
          { email: { contains: searchKeyword, mode: queryMode } },
          { adminOf: { name: { contains: searchKeyword, mode: queryMode } } },
          {
            adminOf: { address: { contains: searchKeyword, mode: queryMode } },
          },
        ];
      }

      const [totalCount, admins] = await Promise.all([
        prismaClient.user.count({
          where: whereCondition,
        }),

        prismaClient.user.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereCondition,
          include: {
            adminOf: true,
          },
        }),
      ]);

      return {
        data: admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          contact: admin.contact,
          name: admin.name,
          joinStatus: admin.joinStatus,
          adminOf: {
            id: admin.adminOf!.id,
            name: admin.adminOf!.name,
            address: admin.adminOf!.address,
            description: admin.adminOf!.description,
            officeNumber: admin.adminOf!.officeNumber,
          },
        })),
        totalCount,
        page,
        limit,
        hasNext: page * limit < totalCount,
      } as AdminListResView;
    } catch (error) {
      throw error;
    }
  };

  const findResidentUserList = async (
    query: ResidentUserListReq,
  ): Promise<ResidentUserListResView> => {
    try {
      const prismaClient = baseQueryRepo.getPrismaClient();
      const { page, limit, searchKeyword, joinStatus, building, unit } = query;

      const residentWhere: Prisma.ResidentWhereInput = {};
      if (building) {
        residentWhere.building = building;
      }
      if (unit) {
        residentWhere.unit = unit;
      }

      const whereCondition: Prisma.UserWhereInput = {
        role: UserRole.USER,
        resident: residentWhere,
      };

      if (joinStatus) {
        whereCondition.joinStatus = joinStatus;
      }

      // 검색어 (이름, 이메일)
      if (searchKeyword) {
        const queryMode: Prisma.QueryMode = "insensitive";
        whereCondition.OR = [
          { name: { contains: searchKeyword, mode: queryMode } },
          { email: { contains: searchKeyword, mode: queryMode } },
        ];
      }

      const [totalCount, residentUsers] = await Promise.all([
        prismaClient.user.count({
          where: whereCondition,
        }),

        prismaClient.user.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereCondition,
          include: {
            resident: true,
          },
        }),
      ]);

      return {
        data: residentUsers.map((residentUser) => ({
          id: residentUser.id,
          email: residentUser.email,
          contact: residentUser.contact,
          name: residentUser.name,
          joinStatus: residentUser.joinStatus,
          resident: {
            id: residentUser.resident!.id,
            building: String(residentUser.resident!.building),
            unit: String(residentUser.resident!.unit),
          },
        })),
        totalCount,
        page,
        limit,
        hasNext: page * limit < totalCount,
      } as ResidentUserListResView;
    } catch (err) {
      throw err;
    }
  };

  return {
    findAdminById,
    getMyProfile,
    findAdminList,
    findResidentUserList,
  };
};
