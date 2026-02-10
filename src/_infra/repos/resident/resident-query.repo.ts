import { Prisma } from "@prisma/client";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import { HouseholdMemberWithRelations } from "../../../_modules/residents/domain/resident.type";
import { IBaseQueryRepo } from "../_base/base-query.repo";

export const ResidentQueryRepository = (
  baseQueryRepo: IBaseQueryRepo,
): IResidentQueryRepo => {
  const prisma = baseQueryRepo.getPrismaClient() as any;

  const buildWhereCondition = (apartmentId?: string, filters?: any): any => {
    const whereCondition: any = {
      household: apartmentId ? { apartmentId } : {},
      movedOutAt: null,
    };

    // 건물 및 호수 필터
    if (filters?.building !== undefined) {
      whereCondition.household.building = filters.building;
    }
    if (filters?.unit !== undefined) {
      whereCondition.household.unit = filters.unit;
    }

    // 가입 상태
    if (filters?.isRegistered !== undefined) {
      if (filters.isRegistered === true) {
        whereCondition.AND = [
          { userId: { not: null } },
          { user: { is: { joinStatus: "APPROVED" } } },
        ];
      } else {
        whereCondition.OR = [
          { userId: null },
          { user: { is: { joinStatus: "PENDING" } } },
        ];
      }
    }

    // 키워드별 (이름, 이메일)
    if (filters?.searchKeyword) {
      const searchCondition = [
        {
          user: {
            name: { contains: filters.searchKeyword, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: filters.searchKeyword, mode: "insensitive" },
          },
        },
      ];

      if (filters?.isRegistered !== undefined) {
        const registrationFilter =
          filters.isRegistered === true
            ? {
                AND: [
                  { userId: { not: null } },
                  { user: { is: { joinStatus: "APPROVED" } } },
                ],
              }
            : {
                OR: [
                  { userId: null },
                  { user: { is: { joinStatus: "PENDING" } } },
                ],
              };

        whereCondition.AND = [registrationFilter, { OR: searchCondition }];
      } else {
        whereCondition.OR = searchCondition;
      }
    }

    if (filters?.isHouseholder !== undefined) {
      whereCondition.isHouseholder = filters.isHouseholder;
    }

    return whereCondition;
  };

  const findHouseholdMembers = async (
    apartmentId?: string,
    page?: number,
    limit?: number,
    filters?: any,
  ): Promise<{
    members: HouseholdMemberWithRelations[];
    total: number;
  }> => {
    const pageNum = page ?? 1;
    const pageLimit = limit ?? 20;
    const skip = (pageNum - 1) * pageLimit;

    const whereCondition = buildWhereCondition(apartmentId, filters);

    const total = await prisma.householdMember.count({
      where: whereCondition,
    });

    const members = await prisma.householdMember.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            contact: true,
            name: true,
            joinStatus: true,
          },
        },
        household: {
          include: {
            apartment: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
      skip,
      take: pageLimit,
      orderBy: { createdAt: "desc" },
    });

    return { members, total };
  };
  // 입주민 상세조회
  const findHouseholdMemberById = async (
    householdMemberId: string,
  ): Promise<HouseholdMemberWithRelations | null> => {
    return await prisma.householdMember.findFirst({
      where: {
        id: householdMemberId,
        movedOutAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            contact: true,
            name: true,
          },
        },
        household: {
          include: {
            apartment: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    });
  };

  // 건물과 호수로 세대 조회
  const findHouseholdByBuildingAndUnit = async (
    apartmentId: string,
    building: number,
    unit: number,
  ): Promise<any | null> => {
    return await prisma.household.findUnique({
      where: {
        apartmentId_building_unit: {
          apartmentId,
          building,
          unit,
        },
      },
      include: {
        members: true,
      },
    });
  };

  // 이메일로 입주민 조회
  const findHouseholdMemberByEmail = async (
    email: string,
  ): Promise<HouseholdMemberWithRelations | null> => {
    return await prisma.householdMember.findFirst({
      where: {
        email,
        movedOutAt: null, // ✅ 삭제되지 않은 입주민만
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            contact: true,
            name: true,
          },
        },
        household: {
          include: {
            apartment: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    });
  };

  return {
    findHouseholdMembers,
    findHouseholdMemberById,
    findHouseholdByBuildingAndUnit,
    findHouseholdMemberByEmail,
  };
};
