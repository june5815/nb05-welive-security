export interface Admin {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly contact: string;
  readonly name: string;
  readonly role: "ADMIN";
}

export interface Apartment {
  readonly id?: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly adminId?: string | null;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: number;
  readonly admin?: Admin;
}

export const ApartmentEntity = {
  create(props: {
    name: string;
    address: string;
    description: string;
    officeNumber: string;
    buildingNumberFrom: number;
    buildingNumberTo: number;
    floorCountPerBuilding: number;
    unitCountPerFloor: number;
  }): Apartment {
    return {
      ...props,
    };
  },

  restore(props: {
    id: string;
    name: string;
    address: string;
    description: string;
    officeNumber: string;
    adminId?: string | null;
    buildingNumberFrom: number;
    buildingNumberTo: number;
    floorCountPerBuilding: number;
    unitCountPerFloor: number;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    admin?: Admin;
  }): Apartment {
    return { ...props };
  },

  update(
    apartment: Apartment,
    updates: {
      name?: string;
      address?: string;
      description?: string;
      officeNumber?: string;
      buildingNumberFrom?: number;
      buildingNumberTo?: number;
      floorCountPerBuilding?: number;
      unitCountPerFloor?: number;
    },
  ): Apartment {
    return {
      ...apartment,
      name: updates.name ?? apartment.name,
      address: updates.address ?? apartment.address,
      description: updates.description ?? apartment.description,
      officeNumber: updates.officeNumber ?? apartment.officeNumber,
      buildingNumberFrom:
        updates.buildingNumberFrom ?? apartment.buildingNumberFrom,
      buildingNumberTo: updates.buildingNumberTo ?? apartment.buildingNumberTo,
      floorCountPerBuilding:
        updates.floorCountPerBuilding ?? apartment.floorCountPerBuilding,
      unitCountPerFloor:
        updates.unitCountPerFloor ?? apartment.unitCountPerFloor,
    };
  },

  assignAdmin(apartment: Apartment, adminId: string, admin: Admin): Apartment {
    return {
      ...apartment,
      adminId,
      admin,
    };
  },

  removeAdmin(apartment: Apartment): Apartment {
    return {
      ...apartment,
      adminId: null,
      admin: undefined,
    };
  },

  getTotalUnits(apartment: Apartment): number {
    const totalBuildings =
      apartment.buildingNumberTo - apartment.buildingNumberFrom + 1;
    const totalUnitsPerBuilding =
      apartment.floorCountPerBuilding * apartment.unitCountPerFloor;
    return totalBuildings * totalUnitsPerBuilding;
  },

  getUnitsPerBuilding(apartment: Apartment): number {
    return apartment.floorCountPerBuilding * apartment.unitCountPerFloor;
  },

  isValidBuilding(apartment: Apartment, building: number): boolean {
    return (
      building >= apartment.buildingNumberFrom &&
      building <= apartment.buildingNumberTo
    );
  },

  isValidUnit(apartment: Apartment, unit: number): boolean {
    const maxUnit =
      apartment.floorCountPerBuilding * apartment.unitCountPerFloor;
    return unit >= 1 && unit <= maxUnit;
  },
};
