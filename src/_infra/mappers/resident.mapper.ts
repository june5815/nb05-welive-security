import { Prisma } from "@prisma/client";
import {
  HouseholdMember,
  HouseholdMemberWithRelations,
  ResidentImportLog,
} from "../../_modules/residents/domain/resident.type";
import {
  HouseholdMemberDetailView,
  HouseholdMembersListView,
  HouseholdMemberView,
} from "../../_modules/residents/dtos/res/resident.view";
import { HouseholdEntity } from "../../_modules/residents/domain/resident.entity";

export const householdMemberFullInclude =
  Prisma.validator<Prisma.HouseholdMemberInclude>()({
    user: {
      select: { id: true, email: true, contact: true, name: true },
    },
    household: {
      select: {
        id: true,
        building: true,
        unit: true,
        apartmentId: true,
        apartment: {
          select: { id: true, name: true, address: true },
        },
      },
    },
  });

export type HouseholdMemberRaw = Prisma.HouseholdMemberGetPayload<{
  include: typeof householdMemberFullInclude;
}>;

export const ResidentMapper = {
  toHouseholdMemberEntity: (raw: HouseholdMemberRaw): HouseholdMember => {
    return HouseholdEntity.restoreHouseholdMember({
      id: raw.id,
      householdId: raw.householdId,
      userId: raw.userId || undefined,
      userType: raw.userType,
      email: raw.email,
      contact: raw.contact,
      name: raw.name,
      isHouseholder: raw.isHouseholder,
      movedInAt: raw.movedInAt ?? undefined,
      movedOutAt: raw.movedOutAt ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },

  toHouseholdMemberEntityArray: (
    raws: HouseholdMemberRaw[],
  ): HouseholdMember[] => {
    return raws.map((raw) => ResidentMapper.toHouseholdMemberEntity(raw));
  },

  toHouseholdMemberCreateInput: (
    member: HouseholdMember,
  ): Prisma.HouseholdMemberCreateInput => ({
    id: member.id,
    userType: member.userType,
    isHouseholder: member.isHouseholder,
    movedInAt: member.movedInAt,
    movedOutAt: member.movedOutAt,
    email: member.email,
    contact: member.contact,
    name: member.name,
    household: {
      connect: { id: member.householdId },
    },
    user: member.userId
      ? {
          connect: { id: member.userId },
        }
      : undefined,
  }),

  toHouseholdMemberCreateInputArray: (
    members: HouseholdMember[],
  ): Prisma.HouseholdMemberCreateInput[] => {
    return members.map((member) =>
      ResidentMapper.toHouseholdMemberCreateInput(member),
    );
  },

  toHouseholdMemberUpdateInput: (
    member: HouseholdMember,
  ): Prisma.HouseholdMemberUpdateInput => {
    const input: Prisma.HouseholdMemberUpdateInput = {
      household: {
        connect: { id: member.householdId },
      },
      isHouseholder: member.isHouseholder,
      movedInAt: member.movedInAt,
      movedOutAt: member.movedOutAt,
      email: member.email,
      contact: member.contact,
      name: member.name,
    };
    return input;
  },

  toHouseholdMemberPartialUpdateInput: (
    updates: Partial<HouseholdMember>,
  ): Prisma.HouseholdMemberUpdateInput => {
    const input: Prisma.HouseholdMemberUpdateInput = {};

    if (updates.isHouseholder !== undefined) {
      input.isHouseholder = updates.isHouseholder;
    }
    if (updates.movedInAt !== undefined) {
      input.movedInAt = updates.movedInAt;
    }
    if (updates.movedOutAt !== undefined) {
      input.movedOutAt = updates.movedOutAt;
    }
    if (updates.email !== undefined) {
      input.email = updates.email;
    }
    if (updates.contact !== undefined) {
      input.contact = updates.contact;
    }
    if (updates.name !== undefined) {
      input.name = updates.name;
    }

    return input;
  },

  toHouseholdMemberView: (
    member: HouseholdMemberWithRelations,
  ): HouseholdMemberView => ({
    id: member.id,
    createdAt: member.createdAt.toISOString(),
    email: member.user?.email ?? member.email,
    contact: member.user?.contact ?? member.contact,
    name: member.user?.name ?? member.name,
    building: member.household.building,
    unit: member.household.unit,
    isHouseholder: member.isHouseholder,
    userId: member.user?.id,
    apartment: {
      id: member.household.apartment.id,
      name: member.household.apartment.name,
      address: member.household.apartment.address,
    },
  }),

  toHouseholdMembersListDto: (
    member: HouseholdMemberWithRelations,
  ): HouseholdMembersListView => ResidentMapper.toHouseholdMemberView(member),

  toHouseholdMembersListDtoArray: (
    members: HouseholdMemberWithRelations[],
  ): HouseholdMembersListView[] => {
    return members.map((member) =>
      ResidentMapper.toHouseholdMemberView(member),
    );
  },

  toHouseholdMemberDetailDto: (
    member: HouseholdMemberWithRelations,
  ): HouseholdMemberDetailView => ResidentMapper.toHouseholdMemberView(member),

  toResidentImportLogEntity: (
    raw: Prisma.ResidentImportLogGetPayload<object>,
  ): ResidentImportLog => {
    return HouseholdEntity.restoreResidentImportLog({
      id: raw.id,
      fileName: raw.fileName,
      totalCount: raw.totalCount,
      successCount: raw.successCount,
      failCount: raw.failCount,
      status: raw.status as "pending" | "success" | "failed",
      errorMessage: raw.errorMessage ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      apartmentId: raw.apartmentId,
      userId: raw.userId,
    });
  },

  toResidentImportLogEntityArray: (
    raws: Prisma.ResidentImportLogGetPayload<object>[],
  ): ResidentImportLog[] => {
    return raws.map((raw) => ResidentMapper.toResidentImportLogEntity(raw));
  },

  toResidentImportLogCreateInput: (
    log: ResidentImportLog,
  ): Prisma.ResidentImportLogCreateInput => ({
    id: log.id,
    fileName: log.fileName,
    totalCount: log.totalCount,
    successCount: log.successCount,
    failCount: log.failCount,
    status: log.status,
    errorMessage: log.errorMessage,
    apartment: {
      connect: { id: log.apartmentId },
    },
    user: {
      connect: { id: log.userId },
    },
  }),

  toResidentImportLogUpdateInput: (
    log: ResidentImportLog,
  ): Prisma.ResidentImportLogUpdateInput => ({
    successCount: log.successCount,
    failCount: log.failCount,
    status: log.status,
    errorMessage: log.errorMessage,
  }),
};
