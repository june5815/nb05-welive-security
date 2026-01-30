import {
  Household,
  HouseholdMember,
} from "../../../../_modules/residents/domain/resident.type";

export interface IResidentCommandRepo {
  createHouseholdMember: (entity: HouseholdMember) => Promise<HouseholdMember>;
  updateHouseholdMember: (entity: HouseholdMember) => Promise<HouseholdMember>;
  createManyHouseholdMembers: (
    entities: HouseholdMember[],
  ) => Promise<HouseholdMember[]>;
  deleteHouseholdMember: (id: string) => Promise<void>;
}
