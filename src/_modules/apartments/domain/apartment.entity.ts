export interface Admin {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly contact: string;
  readonly name: string;
  readonly role: "ADMIN";
}

export enum HouseholdStatus {
  EMPTY = "EMPTY",
  ACTIVE = "ACTIVE",
  MOVE_OUT = "MOVE_OUT",
}

export interface Household {
  readonly id: string;
  readonly apartmentId: string;
  readonly building: number;
  readonly unit: number;
  readonly householdStatus: HouseholdStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
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

  getAllPossibleHouseholds(apartment: Apartment): Array<{
    building: number;
    unit: number;
  }> {
    const households: Array<{ building: number; unit: number }> = [];
    const unitsPerBuilding = ApartmentEntity.getUnitsPerBuilding(apartment);

    for (
      let building = apartment.buildingNumberFrom;
      building <= apartment.buildingNumberTo;
      building++
    ) {
      for (let unit = 1; unit <= unitsPerBuilding; unit++) {
        households.push({ building, unit });
      }
    }

    return households;
  },

  isValidHousehold(
    apartment: Apartment,
    building: number,
    unit: number,
  ): boolean {
    return (
      ApartmentEntity.isValidBuilding(apartment, building) &&
      ApartmentEntity.isValidUnit(apartment, unit)
    );
  },

  getHouseholdCountPerBuilding(apartment: Apartment): number {
    return apartment.floorCountPerBuilding * apartment.unitCountPerFloor;
  },

  getBuildingCount(apartment: Apartment): number {
    return apartment.buildingNumberTo - apartment.buildingNumberFrom + 1;
  },

  getUnitFromFloorAndSequence(
    apartment: Apartment,
    floor: number,
    sequenceInFloor: number,
  ): number | null {
    if (
      floor < 1 ||
      floor > apartment.floorCountPerBuilding ||
      sequenceInFloor < 1 ||
      sequenceInFloor > apartment.unitCountPerFloor
    ) {
      return null;
    }

    return (floor - 1) * apartment.unitCountPerFloor + sequenceInFloor;
  },

  getFloorAndSequenceFromUnit(
    apartment: Apartment,
    unit: number,
  ): { floor: number; sequence: number } | null {
    if (!ApartmentEntity.isValidUnit(apartment, unit)) {
      return null;
    }

    const floor = Math.ceil(unit / apartment.unitCountPerFloor);
    const sequence = ((unit - 1) % apartment.unitCountPerFloor) + 1;

    return { floor, sequence };
  },
};
