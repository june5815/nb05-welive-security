import { Prisma } from "@prisma/client";
import {
  Household,
  HouseholdMember,
  HouseholdMemberWithRelations,
  ResidentImportLog,
} from "../../_modules/residents/domain/resident.type";
import {
  HouseholdMemberDetailView,
  HouseholdMembersListView,
  HouseholdMemberView,
} from "../../_modules/residents/dtos/res/resident.view";
import { ResidentEntity } from "../../_modules/residents/domain/resident.entity";

export const householdMemberFullInclude =
  Prisma.validator<Prisma.HouseholdMemberInclude>()({
    user: {
      select: { id: true, email: true, contact: true, name: true },
    },
    household: {
      select: { id: true, building: true, unit: true, apartmentId: true },
    },
  });

export const householdWithMembersInclude =
  Prisma.validator<Prisma.HouseholdInclude>()({
    members: {
      include: householdMemberFullInclude,
    },
  });

export type HouseholdMemberRaw = Prisma.HouseholdMemberGetPayload<{
  include: typeof householdMemberFullInclude;
}>;

export type HouseholdWithMembersRaw = Prisma.HouseholdGetPayload<{
  include: typeof householdWithMembersInclude;
}>;

export const ResidentMapper = {
  toHouseholdMemberEntity: (raw: HouseholdMemberRaw): HouseholdMember => {
    return ResidentEntity.restoreHouseholdMember({
      id: raw.id,
      householdId: raw.householdId,
      userId: raw.userId || undefined,
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

  toHouseholdEntity: (raw: HouseholdWithMembersRaw): Household => {
    return ResidentEntity.restoreHousehold({
      id: raw.id,
      apartmentId: raw.apartmentId,
      building: raw.building,
      unit: raw.unit,
      householdStatus: raw.householdStatus,
      members: raw.members.map((m) =>
        ResidentMapper.toHouseholdMemberEntity(m),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      version: raw.version,
    });
  },

  toHouseholdEntityArray: (raws: HouseholdWithMembersRaw[]): Household[] => {
    return raws.map((raw) => ResidentMapper.toHouseholdEntity(raw));
  },

  toHouseholdCreateInput: (
    household: Household,
  ): Prisma.HouseholdCreateInput => ({
    id: household.id,
    building: household.building,
    unit: household.unit,
    householdStatus: household.householdStatus,
    apartment: {
      connect: { id: household.apartmentId },
    },
  }),
  toHouseholdMemberCreateInput: (
    member: HouseholdMember,
  ): Prisma.HouseholdMemberCreateInput => ({
    id: member.id,
    isHouseholder: member.isHouseholder,
    movedInAt: member.movedInAt,
    movedOutAt: member.movedOutAt,
    household: {
      connect: { id: member.householdId },
    },
    user: {
      connect: { id: member.userId! },
    },
    email: member.email,
    contact: member.contact,
    name: member.name,
  }),

  toHouseholdMemberCreateInputArray: (
    members: HouseholdMember[],
  ): Prisma.HouseholdMemberCreateInput[] => {
    return members.map((member) =>
      ResidentMapper.toHouseholdMemberCreateInput(member),
    );
  },

  toHouseholdUpdateInput: (
    household: Household,
  ): Prisma.HouseholdUpdateInput => ({
    householdStatus: household.householdStatus,
  }),

  toHouseholdPartialUpdateInput: (
    updates: Partial<Household>,
  ): Prisma.HouseholdUpdateInput => {
    const input: Prisma.HouseholdUpdateInput = {};

    if (updates.householdStatus !== undefined) {
      input.householdStatus = updates.householdStatus;
    }

    return input;
  },

  toHouseholdMemberUpdateInput: (
    member: HouseholdMember,
  ): Prisma.HouseholdMemberUpdateInput => ({
    isHouseholder: member.isHouseholder,
    movedInAt: member.movedInAt,
    movedOutAt: member.movedOutAt,
  }),

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

    return input;
  },

  toHouseholdMemberBatchUpdateInput: (
    members: Partial<HouseholdMember>[],
  ): Prisma.HouseholdMemberUpdateInput[] => {
    return members.map((member) =>
      ResidentMapper.toHouseholdMemberPartialUpdateInput(member),
    );
  },

  toHouseholdMemberView: (
    member: HouseholdMemberWithRelations,
  ): HouseholdMemberView => ({
    id: member.id,
    createdAt: member.createdAt.toISOString(),
    email: member.user.email,
    contact: member.user.contact,
    name: member.user.name,
    building: member.household.building,
    unit: member.household.unit,
    isHouseholder: member.isHouseholder,
    userId: member.user.id,
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
    return ResidentEntity.restoreResidentImportLog({
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
