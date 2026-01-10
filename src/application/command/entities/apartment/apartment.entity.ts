export type ApartmentEntity = {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description?: string;
  readonly officeNumber?: string;
  readonly managerId?: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateApartmentInput = {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description?: string;
  readonly officeNumber?: string;
  readonly managerId?: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
};

export type UpdateApartmentInput = {
  readonly name?: string;
  readonly address?: string;
  readonly description?: string;
  readonly officeNumber?: string;
  readonly managerId?: string;
};

export type NewApartmentEntity = Omit<ApartmentEntity, "id">;

export const create = (input: CreateApartmentInput): ApartmentEntity => ({
  id: input.id,
  name: input.name,
  address: input.address,
  description: input.description,
  officeNumber: input.officeNumber,
  managerId: input.managerId,
  buildingNumberFrom: input.buildingNumberFrom,
  buildingNumberTo: input.buildingNumberTo,
  floorCountPerBuilding: input.floorCountPerBuilding,
  unitCountPerFloor: input.unitCountPerFloor,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
});

export const getId = (apartment: ApartmentEntity): string => apartment.id;
export const getName = (apartment: ApartmentEntity): string => apartment.name;
export const getAddress = (apartment: ApartmentEntity): string =>
  apartment.address;
export const getDescription = (
  apartment: ApartmentEntity,
): string | undefined => apartment.description;
export const getOfficeNumber = (
  apartment: ApartmentEntity,
): string | undefined => apartment.officeNumber;
export const getManagerId = (apartment: ApartmentEntity): string | undefined =>
  apartment.managerId;
export const getBuildingNumberFrom = (apartment: ApartmentEntity): number =>
  apartment.buildingNumberFrom;
export const getBuildingNumberTo = (apartment: ApartmentEntity): number =>
  apartment.buildingNumberTo;
export const getFloorCountPerBuilding = (apartment: ApartmentEntity): number =>
  apartment.floorCountPerBuilding;
export const getUnitCountPerFloor = (apartment: ApartmentEntity): number =>
  apartment.unitCountPerFloor;
export const getCreatedAt = (apartment: ApartmentEntity): Date =>
  apartment.createdAt;
export const getUpdatedAt = (apartment: ApartmentEntity): Date =>
  apartment.updatedAt;
export const getVersion = (apartment: ApartmentEntity): number =>
  apartment.version;

export const hasManager = (apartment: ApartmentEntity): boolean =>
  apartment.managerId !== undefined;

export const isValidBuildingRange = (apartment: ApartmentEntity): boolean =>
  apartment.buildingNumberFrom <= apartment.buildingNumberTo;

export const containsBuilding = (
  apartment: ApartmentEntity,
  buildingNumber: number,
): boolean =>
  buildingNumber >= apartment.buildingNumberFrom &&
  buildingNumber <= apartment.buildingNumberTo;

export const isUpdatedRecently = (
  apartment: ApartmentEntity,
  minutesAgo: number,
): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - apartment.updatedAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes < minutesAgo;
};

const updateMetadata = (
  apartment: ApartmentEntity,
): Omit<ApartmentEntity, "id" | "createdAt"> => ({
  ...apartment,
  updatedAt: new Date(),
  version: apartment.version + 1,
});

export const updateName = (
  apartment: ApartmentEntity,
  name: string,
): ApartmentEntity => ({
  ...updateMetadata(apartment),
  name,
  id: apartment.id,
  createdAt: apartment.createdAt,
});

export const updateAddress = (
  apartment: ApartmentEntity,
  address: string,
): ApartmentEntity => ({
  ...updateMetadata(apartment),
  address,
  id: apartment.id,
  createdAt: apartment.createdAt,
});

export const updateDescription = (
  apartment: ApartmentEntity,
  description: string | undefined,
): ApartmentEntity => ({
  ...updateMetadata(apartment),
  description,
  id: apartment.id,
  createdAt: apartment.createdAt,
});

export const updateOfficeNumber = (
  apartment: ApartmentEntity,
  officeNumber: string | undefined,
): ApartmentEntity => ({
  ...updateMetadata(apartment),
  officeNumber,
  id: apartment.id,
  createdAt: apartment.createdAt,
});

export const updateManager = (
  apartment: ApartmentEntity,
  managerId: string | undefined,
): ApartmentEntity => ({
  ...updateMetadata(apartment),
  managerId,
  id: apartment.id,
  createdAt: apartment.createdAt,
});

export const updateMultiple = (
  apartment: ApartmentEntity,
  updates: Partial<UpdateApartmentInput>,
): ApartmentEntity => {
  let updated = apartment;

  if (updates.name !== undefined) {
    updated = updateName(updated, updates.name);
  }
  if (updates.address !== undefined) {
    updated = updateAddress(updated, updates.address);
  }
  if (updates.description !== undefined) {
    updated = updateDescription(updated, updates.description);
  }
  if (updates.officeNumber !== undefined) {
    updated = updateOfficeNumber(updated, updates.officeNumber);
  }
  if (updates.managerId !== undefined) {
    updated = updateManager(updated, updates.managerId);
  }

  return updated;
};

export const generateBuildingNumbers = (
  apartment: ApartmentEntity,
): number[] => {
  const buildings: number[] = [];
  for (
    let i = apartment.buildingNumberFrom;
    i <= apartment.buildingNumberTo;
    i++
  ) {
    buildings.push(i);
  }
  return buildings;
};

export const generateUnitNumbers = (apartment: ApartmentEntity): number[] => {
  const units: number[] = [];
  for (let i = 1; i <= apartment.unitCountPerFloor; i++) {
    units.push(i);
  }
  return units;
};

export type ApartmentDTO = ApartmentEntity & {
  readonly buildings: number[];
  readonly units: number[];
};

export const toDTO = (apartment: ApartmentEntity): ApartmentDTO => ({
  ...apartment,
  buildings: generateBuildingNumbers(apartment),
  units: generateUnitNumbers(apartment),
});
