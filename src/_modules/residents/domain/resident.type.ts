import { createDeflate } from "zlib";
import { id } from "zod/v4/locales";

export const UserType = {
  PRE_RESIDENT: "PRE_RESIDENT",
  RESIDENT: "RESIDENT",
} as const;
export type UserType = (typeof UserType)[keyof typeof UserType];

export const HouseholdStatus = {
  EMPTY: "EMPTY",
  ACTIVE: "ACTIVE",
  MOVE_OUT: "MOVE_OUT",
} as const;
export type HouseholdStatus =
  (typeof HouseholdStatus)[keyof typeof HouseholdStatus];

export const HouseholdMemberStatus = {
  EMPTY: "EMPTY",
  ACTIVE: "ACTIVE",
  MOVE_OUT: "MOVE_OUT",
} as const;
export type HouseholdMemberStatus =
  (typeof HouseholdMemberStatus)[keyof typeof HouseholdMemberStatus];

export interface Household {
  readonly id: string;
  readonly apartmentId: string;
  readonly building: number;
  readonly unit: number;
  readonly householdStatus: HouseholdStatus;
  readonly movedOutAt?: Date;
  readonly members?: HouseholdMember[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

export interface HouseholdMember {
  readonly id: string;
  readonly householdId: string;
  readonly userId: string;
  readonly isHouseholder: boolean;
  readonly householdMemberStatus: HouseholdMemberStatus;
  readonly movedInAt?: Date;
  readonly movedOutAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ResidentImportLog {
  readonly id: string;
  readonly fileName: string;
  readonly totalCount: number;
  readonly successCount: number;
  readonly failCount: number;
  readonly status: "pending" | "success" | "failed";
  readonly errorMessage?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly apartmentId: string;
  readonly userId: string;
}

export interface HouseholdMemberWithRelations extends HouseholdMember {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly contact: string;
    readonly name: string;
  };
  readonly household: {
    readonly id: string;
    readonly building: number;
    readonly unit: number;
  };
}
