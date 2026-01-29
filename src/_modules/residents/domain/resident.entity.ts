import {
  Household,
  HouseholdMember,
  ResidentImportLog,
  HouseholdStatus,
} from "./resident.type";

export const ResidentEntity = {
  createHousehold(props: {
    apartmentId: string;
    building: number;
    unit: number;
  }): Household {
    return {
      id: crypto.randomUUID(),
      apartmentId: props.apartmentId,
      building: props.building,
      unit: props.unit,
      householdStatus: "EMPTY" as HouseholdStatus,
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  },

  restoreHousehold(props: Household): Household {
    return { ...props };
  },
  //세대 상태
  activateHousehold(household: Household): Household {
    return {
      ...household,
      householdStatus: "ACTIVE" as HouseholdStatus,
      updatedAt: new Date(),
    };
  },
  moveOutHousehold(household: Household): Household {
    return {
      ...household,
      householdStatus: "MOVE_OUT" as HouseholdStatus,
      updatedAt: new Date(),
    };
  },
  emptyHousehold(household: Household): Household {
    return {
      ...household,
      householdStatus: "EMPTY" as HouseholdStatus,
      updatedAt: new Date(),
    };
  },

  //세대 정보
  updateHousehold(
    household: Household,
    updates: {
      building?: number;
      unit?: number;
      householdStatus?: HouseholdStatus;
    },
  ): Household {
    return {
      ...household,
      building: updates.building ?? household.building,
      unit: updates.unit ?? household.unit,
      householdStatus: updates.householdStatus ?? household.householdStatus,
      updatedAt: new Date(),
    };
  },

  hasActiveMembers(household: Household): boolean {
    if (!household.members || household.members.length === 0) return false;
    return household.members.some((member) => !member.movedOutAt);
  },

  getActiveMembers(household: Household): HouseholdMember[] {
    if (!household.members) return [];
    return household.members.filter((member) => !member.movedOutAt);
  },

  getHouseholder(household: Household): HouseholdMember | undefined {
    if (!household.members) return undefined;
    return household.members.find((member) => member.isHouseholder);
  },

  getOrdinaryMembers(household: Household): HouseholdMember[] {
    if (!household.members) return [];
    return household.members.filter((member) => !member.isHouseholder);
  },

  getActiveMemberCount(household: Household): number {
    return ResidentEntity.getActiveMembers(household).length;
  },

  createHouseholdMember(props: {
    householdId: string;
    isHouseholder: boolean;
    movedInAt?: Date;
    email: string;
    contact: string;
    name: string;
  }): HouseholdMember {
    return {
      id: crypto.randomUUID(),
      householdId: props.householdId,
      email: props.email,
      contact: props.contact,
      name: props.name,
      isHouseholder: props.isHouseholder,
      movedInAt: props.movedInAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  restoreHouseholdMember(props: HouseholdMember): HouseholdMember {
    return { ...props };
  },

  designateAsHouseholder(member: HouseholdMember): HouseholdMember {
    return {
      ...member,
      isHouseholder: true,
      updatedAt: new Date(),
    };
  },

  /**
   * 세대주 해제
   */
  removeHouseholderStatus(member: HouseholdMember): HouseholdMember {
    return {
      ...member,
      isHouseholder: false,
      updatedAt: new Date(),
    };
  },

  moveOutMember(member: HouseholdMember, movedOutAt?: Date): HouseholdMember {
    return {
      ...member,
      movedOutAt: movedOutAt || new Date(),
      updatedAt: new Date(),
    };
  },

  moveInMember(member: HouseholdMember, movedInAt?: Date): HouseholdMember {
    return {
      ...member,
      movedInAt: movedInAt || new Date(),
      movedOutAt: undefined,
      updatedAt: new Date(),
    };
  },

  addMemberToHousehold(
    household: Household,
    member: HouseholdMember,
  ): Household {
    return {
      ...household,
      members: [...(household.members || []), member],
      updatedAt: new Date(),
    };
  },

  removeMemberFromHousehold(household: Household, memberId: string): Household {
    return {
      ...household,
      members: (household.members || []).filter((m) => m.id !== memberId),
      updatedAt: new Date(),
    };
  },

  updateMembers(household: Household, members: HouseholdMember[]): Household {
    return {
      ...household,
      members,
      updatedAt: new Date(),
    };
  },

  findMemberByUserId(
    household: Household,
    userId: string,
  ): HouseholdMember | undefined {
    if (!household.members) return undefined;
    return household.members.find((m) => m.userId === userId);
  },

  // ResidentImportLog
  createResidentImportLog(props: {
    fileName: string;
    totalCount: number;
    apartmentId: string;
    userId: string;
  }): ResidentImportLog {
    return {
      id: crypto.randomUUID(),
      fileName: props.fileName,
      totalCount: props.totalCount,
      successCount: 0,
      failCount: 0,
      status: "pending",
      apartmentId: props.apartmentId,
      userId: props.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  restoreResidentImportLog(props: ResidentImportLog): ResidentImportLog {
    return { ...props };
  },

  updateImportProgress(
    log: ResidentImportLog,
    successCount: number,
    failCount: number,
  ): ResidentImportLog {
    return {
      ...log,
      successCount,
      failCount,
      updatedAt: new Date(),
    };
  },

  completeImportSuccess(log: ResidentImportLog): ResidentImportLog {
    return {
      ...log,
      status: "success",
      updatedAt: new Date(),
    };
  },

  completeImportFailed(
    log: ResidentImportLog,
    errorMessage: string,
  ): ResidentImportLog {
    return {
      ...log,
      status: "failed",
      errorMessage,
      updatedAt: new Date(),
    };
  },
};
