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

export interface Household {
  readonly id: string;
  readonly apartmentId: string;
  readonly building: number;
  readonly unit: number;
  readonly householdStatus: HouseholdStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly members?: HouseholdMember[];
}

export interface HouseholdMember {
  readonly id: string;
  readonly householdId: string;
  readonly userId?: string;
  readonly userType: UserType;
  readonly email: string;
  readonly contact: string;
  readonly name: string;
  readonly isHouseholder: boolean;
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
    readonly apartmentId: string;
    readonly apartment: {
      readonly id: string;
      readonly name: string;
      readonly address: string;
    };
  };
}

export interface HouseholdWithMembers extends Household {
  readonly members: HouseholdMemberWithRelations[];
}
