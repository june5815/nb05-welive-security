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
    apartmentId: string,
    page: number,
    limit: number,
  ): Promise<{
    members: HouseholdMemberWithRelations[];
    total: number;
  }> => {
    const skip = (page - 1) * limit;

    const total = await prisma.householdMember.count({
      where: {
        household: { apartmentId },
      },
    });

    const members = await prisma.householdMember.findMany({
      where: {
        household: { apartmentId },
      },
      include: {
        user: true,
        household: true,
      },
      skip,
      take: limit,
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
    const member = await prisma.householdMember.findUnique({
      where: { id: householdMemberId },
      include: {
        user: true,
        household: true,
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
          apartment_building_unit: {
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
      const member = await prisma.householdMember.findUnique({
        where: { email },
        include: {
          user: true,
          household: true,
        },
      });

      return member;
    } catch (error) {
      throw error;
    }
  };

  return {
    findHouseholdMembers,
    findHouseholdMemberById,
    findHouseholdByBuildingAndUnit,
    findHouseholdMemberByEmail,
  };
};
