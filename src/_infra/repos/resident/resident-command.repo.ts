import { IResidentCommandRepo } from "../../../_common/ports/repos/resident/resident-command.repo.interface";
import { HouseholdMember } from "../../../_modules/residents/domain/resident.type";
import {
  ResidentMapper,
  householdMemberFullInclude,
} from "../../mappers/resident.mapper";
import { IBaseCommandRepo } from "../_base/base-command.repo";
import { Prisma } from "@prisma/client";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";

export const ResidentCommandRepository = (
  baseCommandRepo: IBaseCommandRepo,
): IResidentCommandRepo => {
  const createHouseholdMember = async (
    entity: HouseholdMember,
  ): Promise<HouseholdMember> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const savedHouseholdMember = await prisma.householdMember.create({
        data: ResidentMapper.toHouseholdMemberCreateInput(entity),
        include: householdMemberFullInclude,
      });

      return ResidentMapper.toHouseholdMemberEntity(savedHouseholdMember);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta as any)?.target;
          if (target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }
        }
      }

      throw error;
    }
  };

  const updateHouseholdMember = async (
    entity: HouseholdMember,
  ): Promise<HouseholdMember> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const updatedHouseholdMember = await prisma.householdMember.update({
        where: { id: entity.id },
        data: ResidentMapper.toHouseholdMemberUpdateInput(entity),
        include: householdMemberFullInclude,
      });

      return ResidentMapper.toHouseholdMemberEntity(updatedHouseholdMember);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta as any)?.target;
          if (target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }
        }

        if (error.code === "P2025") {
          throw new TechnicalException({
            type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
            error: error,
          });
        }
      }

      throw error;
    }
  };

  const createManyHouseholdMembers = async (
    entities: HouseholdMember[],
  ): Promise<HouseholdMember[]> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();

      if (entities.length === 0) {
        return [];
      }

      // 벌크 생성
      const createManyData: Prisma.HouseholdMemberCreateManyInput[] =
        entities.map((entity) => ({
          id: entity.id,
          householdId: entity.householdId,
          userId: entity.userId,
          email: entity.email,
          contact: entity.contact,
          name: entity.name,
          isHouseholder: entity.isHouseholder,
          movedInAt: entity.movedInAt,
          movedOutAt: entity.movedOutAt,
        }));

      await prisma.householdMember.createMany({
        data: createManyData,
        skipDuplicates: false,
      });

      // 생성된 데이터 조회 (ID)
      const savedHouseholdMembers = await prisma.householdMember.findMany({
        where: {
          id: {
            in: entities.map((e) => e.id),
          },
        },
        include: householdMemberFullInclude,
      });

      return ResidentMapper.toHouseholdMemberEntityArray(savedHouseholdMembers);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta as any)?.target;
          if (target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }
        }
      }

      throw error;
    }
  };

  const deleteHouseholdMember = async (id: string): Promise<void> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();

      await prisma.householdMember.update({
        where: { id },
        data: {
          movedOutAt: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return;
      }

      throw error;
    }
  };

  return {
    createHouseholdMember,
    updateHouseholdMember,
    createManyHouseholdMembers,
    deleteHouseholdMember,
  };
};
