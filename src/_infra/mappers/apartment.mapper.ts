import { Apartment, Apartment as ApartmentPrisma } from "@prisma/client";
import { generateId } from "../../_common/utils/id-generator.util";
import {
  ApartmentDetailResView,
  ApartmentListResView,
  ApartmentListItemResView,
} from "../../_modules/apartments/dtos/res/apartment.view";

type Household = { building: number; unit: number };
type ApartmentWithHousehold = ApartmentPrisma & {
  household: Household[];
};

const getBuildings = (households: Household[]): number[] =>
  Array.from(new Set(households.map((h) => h.building))).sort((a, b) => a - b);

const getUnits = (households: Household[]): number[] =>
  Array.from(new Set(households.map((h) => h.unit))).sort((a, b) => a - b);

const extractHouseholds = (apartment: ApartmentWithHousehold): Household[] =>
  apartment.household || [];

export const toDomain = (raw: ApartmentPrisma): Apartment => ({
  id: raw.id,
  name: raw.name,
  address: raw.address,
  description: raw.description,
  officeNumber: raw.officeNumber,
  adminId: raw.adminId || null,
  buildingNumberFrom: raw.buildingNumberFrom,
  buildingNumberTo: raw.buildingNumberTo,
  floorCountPerBuilding: raw.floorCountPerBuilding,
  unitCountPerFloor: raw.unitCountPerFloor,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  version: raw.version,
});

const basePersistenceData = (entity: Apartment) => ({
  name: entity.name,
  address: entity.address,
  description: entity.description,
  officeNumber: entity.officeNumber,
  adminId: entity.adminId || null,
  buildingNumberFrom: entity.buildingNumberFrom,
  buildingNumberTo: entity.buildingNumberTo,
  floorCountPerBuilding: entity.floorCountPerBuilding,
  unitCountPerFloor: entity.unitCountPerFloor,
});

export const toPersistenceCreate = (
  entity: Apartment,
): Omit<ApartmentPrisma, "createdAt" | "updatedAt" | "version"> => ({
  id: entity.id || generateId(),
  ...basePersistenceData(entity),
});

export const toPersistenceUpdate = (
  entity: Apartment,
): Omit<ApartmentPrisma, "createdAt" | "updatedAt" | "version" | "id"> =>
  basePersistenceData(entity);

export const toPersistence = (entity: Apartment): Partial<ApartmentPrisma> => ({
  id: entity.id || generateId(),
  ...basePersistenceData(entity),
});

const toListApartmentItem = (
  apartment: ApartmentWithHousehold,
): ApartmentListItemResView => {
  const households = extractHouseholds(apartment);
  return {
    id: apartment.id,
    name: apartment.name,
    address: apartment.address,
    description: apartment.description,
    officeNumber: apartment.officeNumber,
    buildings: getBuildings(households),
    units: getUnits(households),
  };
};

export const toListPresentation = (
  apartments: ApartmentWithHousehold[],
  totalCount: number,
  page: number,
  limit: number,
): ApartmentListResView => {
  const data = apartments.map(toListApartmentItem);
  const hasNext = page * limit < totalCount;

  return {
    data,
    totalCount,
    page,
    limit,
    hasNext,
  };
};
export const toDetailPresentation = (
  apartment: ApartmentWithHousehold,
): ApartmentDetailResView => {
  const households = extractHouseholds(apartment);
  const buildings = getBuildings(households);
  const units = getUnits(households);

  return {
    ...apartment,
    totalUnits: households.length,
    buildingCount: buildings.length,
    householdCountPerBuilding:
      households.length > 0 ? households.length / buildings.length : 0,
    buildings,
    units,
  };
};

export const toDetailPresentationArray = (
  apartments: ApartmentWithHousehold[],
): ApartmentDetailResView[] => apartments.map(toDetailPresentation);
interface HouseholdListItem {
  building: number;
  unit: number;
  floor: number;
  sequence: number;
  displayName: string;
}

const createHouseholdRange = (
  buildingNumber: number,
  floor: number,
  sequence: number,
): HouseholdListItem => ({
  building: buildingNumber,
  unit: floor * 100 + sequence,
  floor,
  sequence,
  displayName: `${buildingNumber}동 ${floor}층 ${sequence}호`,
});

const generateHouseholdsForBuilding = (
  building: number,
  floorCount: number,
  unitCount: number,
): HouseholdListItem[] => {
  const households: HouseholdListItem[] = [];

  for (let f = 1; f <= floorCount; f++) {
    for (let u = 1; u <= unitCount; u++) {
      households.push(createHouseholdRange(building, f, u));
    }
  }

  return households;
};

export const toHouseholdList = (
  apartment: ApartmentPrisma,
): HouseholdListItem[] => {
  const households: HouseholdListItem[] = [];

  for (
    let b = apartment.buildingNumberFrom;
    b <= apartment.buildingNumberTo;
    b++
  ) {
    households.push(
      ...generateHouseholdsForBuilding(
        b,
        apartment.floorCountPerBuilding,
        apartment.unitCountPerFloor,
      ),
    );
  }

  return households;
};
export const ApartmentMapper = {
  toDomain,
  toPersistenceCreate,
  toPersistenceUpdate,
  toPersistence,
  toListPresentation,
  toListApartmentItem,
  toDetailPresentation,
  toDetailPresentationArray,
  toHouseholdList,
};
