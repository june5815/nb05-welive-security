import { HouseholdMemberWithRelations } from "../../../../_modules/residents/domain/resident.type";

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
}
