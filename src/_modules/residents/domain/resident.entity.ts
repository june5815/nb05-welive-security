import {
  Household,
  HouseholdMember,
  ResidentImportLog,
  HouseholdStatus,
  HouseholdMemberStatus,
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
      householdStatus: "ACTIVE" as HouseholdStatus,
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  },

  restoreHousehold(props: Household): Household {
    return { ...props };
  },

  moveOutHousehold(household: Household, movedOutAt: Date): Household {
    return {
      ...household,
      householdStatus: "MOVE_OUT" as HouseholdStatus,
      movedOutAt,
      updatedAt: new Date(),
    };
  },

  activateHousehold(household: Household): Household {
    return {
      ...household,
      householdStatus: "ACTIVE" as HouseholdStatus,
      movedOutAt: undefined,
      updatedAt: new Date(),
    };
  },

  addMember(household: Household, member: HouseholdMember): Household {
    return {
      ...household,
      members: [...(household.members || []), member],
      updatedAt: new Date(),
    };
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
      householdMemberStatus: "ACTIVE" as HouseholdMemberStatus,
      movedInAt: props.movedInAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  restoreHouseholdMember(props: HouseholdMember): HouseholdMember {
    return { ...props };
  },

  moveOutHouseholdMember(
    member: HouseholdMember,
    movedOutAt: Date,
  ): HouseholdMember {
    return {
      ...member,
      householdMemberStatus: "MOVE_OUT" as HouseholdMemberStatus,
      movedOutAt,
      updatedAt: new Date(),
    };
  },

  designateAsHouseholder(member: HouseholdMember): HouseholdMember {
    return {
      ...member,
      isHouseholder: true,
      updatedAt: new Date(),
    };
  },

  removeHouseholder(member: HouseholdMember): HouseholdMember {
    return {
      ...member,
      isHouseholder: false,
      updatedAt: new Date(),
    };
  },

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
