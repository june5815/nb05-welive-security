import { Prisma } from "@prisma/client";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import { HouseholdMemberWithRelations } from "../../../_modules/residents/domain/resident.type";
import { IBaseQueryRepo } from "../_base/base-query.repo";

export const ResidentQueryRepository = (
  baseQueryRepo: IBaseQueryRepo,
): IResidentQueryRepo => {
  const prisma = baseQueryRepo.getPrismaClient() as any;

  // 목록조회
  const findHouseholdMembers = async (
    apartmentId?: string,
    page?: number,
    limit?: number,
    filters?: any,
  ): Promise<{
    members: HouseholdMemberWithRelations[];
    total: number;
  }> => {
    const skip = ((page ?? 1) - 1) * (limit ?? 20);

    const whereCondition: any = {
      movedOutAt: null,
    };
    if (apartmentId) {
      whereCondition.household = { apartmentId };
    } else {
      whereCondition.household = {};
    }

    if (filters?.building !== undefined) {
      whereCondition.household.building = filters.building;
    }
    if (filters?.unit !== undefined) {
      whereCondition.household.unit = filters.unit;
    }
    if (filters?.searchKeyword) {
      whereCondition.OR = [
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
    }
    if (filters?.isHouseholder !== undefined) {
      whereCondition.isHouseholder = filters.isHouseholder;
    }
    if (filters?.isRegistered !== undefined) {
      if (filters.isRegistered) {
        whereCondition.user = {
          ...whereCondition.user,
          joinStatus: "APPROVED",
        };
      } else {
        whereCondition.OR = [
          {
            user: {
              joinStatus: "PENDING",
            },
          },
          {
            userId: null,
          },
        ];
      }
    }

    const total = await prisma.householdMember.count({
      where: whereCondition,
    });

    const members = await prisma.householdMember.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, email: true, contact: true, name: true },
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
      take: limit ?? 20,
      orderBy: { createdAt: "desc" },
    });

    return {
      members,
      total,
    };
  };
  // 입주민 상세조회
  const findHouseholdMemberById = async (
    householdMemberId: string,
  ): Promise<HouseholdMemberWithRelations | null> => {
    const member = await prisma.householdMember.findFirst({
      where: {
        id: householdMemberId,
        movedOutAt: null,
      },
      include: {
        user: {
          select: { id: true, email: true, contact: true, name: true },
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

    return member;
  };

  const findHouseholdByBuildingAndUnit = async (
    apartmentId: string,
    building: number,
    unit: number,
  ): Promise<any | null> => {
    try {
      const household = await prisma.household.findUnique({
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

      return household;
    } catch (error) {
      throw error;
    }
  };

  const findHouseholdMemberByEmail = async (
    email: string,
  ): Promise<HouseholdMemberWithRelations | null> => {
    try {
      const member = await prisma.householdMember.findFirst({
        where: {
          email,
          movedOutAt: null,
        },
        include: {
          user: {
            select: { id: true, email: true, contact: true, name: true },
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

      return member;
    } catch (error) {
      throw error;
    }
  };

  const findApartmentByAdminInfo = async (
    name: string,
    address: string,
    officeNumber: string,
  ): Promise<{ id: string; name: string; address: string } | null> => {
    try {
      const apartment = await prisma.apartment.findFirst({
        where: {
          name,
          address,
          officeNumber,
        },
        select: {
          id: true,
          name: true,
          address: true,
        },
      });

      return apartment;
    } catch (error) {
      throw error;
    }
  };

  return {
    findHouseholdMembers,
    findHouseholdMemberById,
    findHouseholdByBuildingAndUnit,
    findHouseholdMemberByEmail,
    findApartmentByAdminInfo,
  };
};
