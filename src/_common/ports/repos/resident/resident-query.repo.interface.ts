import {
  HouseholdMemberWithRelations,
  Household,
} from "../../../../_modules/residents/domain/resident.type";

export interface HouseholdMembersFilter {
  searchKeyword?: string;
  building?: number;
  unit?: number;
  isHouseholder?: boolean;
  isRegistered?: boolean;
}

export interface IResidentQueryRepo {
  findHouseholdMembers: (
    apartmentId: string,
    page: number,
    limit: number,
    filters?: HouseholdMembersFilter,
  ) => Promise<{ members: HouseholdMemberWithRelations[]; total: number }>;

  findHouseholdMemberById: (
    id: string,
  ) => Promise<HouseholdMemberWithRelations | null>;

  findHouseholdByBuildingAndUnit: (
    apartmentId: string,
    building: number,
    unit: number,
  ) => Promise<Household | null>;

  findHouseholdMemberByEmail: (
    email: string,
  ) => Promise<HouseholdMemberWithRelations | null>;
}
