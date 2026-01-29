import { Prisma } from "@prisma/client";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import { HouseholdMemberWithRelations } from "../../../_modules/residents/domain/resident.type";
import { IBaseQueryRepo } from "../_base/base-query.repo";

export const createResidentQueryRepository = (
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

  return {
    findHouseholdMembers,
    findHouseholdMemberById,
  };
};
