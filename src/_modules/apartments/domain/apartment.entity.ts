export interface AdminUser {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly contact: string;
}

export interface Apartment {
  readonly id?: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly adminId?: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: number;

  readonly admin?: AdminUser;
}

export interface CreateApartmentRequest {
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly adminId?: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
}

export interface UpdateApartmentRequest {
  readonly name?: string;
  readonly address?: string;
  readonly description?: string;
  readonly officeNumber?: string;
  readonly adminId?: string;
  readonly buildingNumberFrom?: number;
  readonly buildingNumberTo?: number;
  readonly floorCountPerBuilding?: number;
  readonly unitCountPerFloor?: number;
}

const APARTMENT_RULES = {
  MIN_BUILDING_NUMBER: 1,
  MAX_BUILDING_COUNT: 999,
  MIN_FLOOR_COUNT: 1,
  MAX_FLOOR_COUNT: 100,
  MIN_UNIT_COUNT: 1,
  MAX_UNIT_COUNT: 1000,
} as const;

export const validateBuildingRange = (from: number, to: number): boolean => {
  return (
    from >= APARTMENT_RULES.MIN_BUILDING_NUMBER &&
    to >= from &&
    to - from + 1 <= APARTMENT_RULES.MAX_BUILDING_COUNT
  );
};

export const validateFloorCount = (floorCount: number): boolean => {
  return (
    floorCount >= APARTMENT_RULES.MIN_FLOOR_COUNT &&
    floorCount <= APARTMENT_RULES.MAX_FLOOR_COUNT
  );
};

export const validateUnitCount = (unitCount: number): boolean => {
  return (
    unitCount >= APARTMENT_RULES.MIN_UNIT_COUNT &&
    unitCount <= APARTMENT_RULES.MAX_UNIT_COUNT
  );
};

export const validateApartment = (
  data: CreateApartmentRequest | UpdateApartmentRequest,
): [boolean, string[]] => {
  const errors: string[] = [];

  if (
    data.buildingNumberFrom !== undefined &&
    data.buildingNumberTo !== undefined
  ) {
    if (
      !validateBuildingRange(data.buildingNumberFrom, data.buildingNumberTo)
    ) {
      errors.push(
        `건물 번호 범위가 유효하지 않습니다. 범위: ${APARTMENT_RULES.MIN_BUILDING_NUMBER} ~ ${APARTMENT_RULES.MAX_BUILDING_COUNT}`,
      );
    }
  }

  if (data.floorCountPerBuilding !== undefined) {
    if (!validateFloorCount(data.floorCountPerBuilding)) {
      errors.push(
        `층 수가 유효하지 않습니다. 범위: ${APARTMENT_RULES.MIN_FLOOR_COUNT} ~ ${APARTMENT_RULES.MAX_FLOOR_COUNT}`,
      );
    }
  }

  if (data.unitCountPerFloor !== undefined) {
    if (!validateUnitCount(data.unitCountPerFloor)) {
      errors.push(
        `호수가 유효하지 않습니다. 범위: ${APARTMENT_RULES.MIN_UNIT_COUNT} ~ ${APARTMENT_RULES.MAX_UNIT_COUNT}`,
      );
    }
  }

  return [errors.length === 0, errors];
};

export const generateBuildings = (from: number, to: number): number[] => {
  const buildings: number[] = [];
  for (let i = from; i <= to; i++) {
    buildings.push(i);
  }
  return buildings;
};

export const generateUnits = (
  floorCount: number,
  unitCount: number,
): number[] => {
  const units: number[] = [];
  for (let floor = 1; floor <= floorCount; floor++) {
    for (let unit = 1; unit <= unitCount; unit++) {
      units.push(floor * 100 + unit);
    }
  }
  return units;
};

export const ApartmentEntity = {
  create(props: CreateApartmentRequest): Apartment {
    const [isValid, errors] = validateApartment(props);
    if (!isValid) {
      throw new Error(`아파트 생성 실패: ${errors.join(", ")}`);
    }

    return {
      ...props,
    };
  },

  restore(props: Required<Apartment>): Apartment {
    return { ...props };
  },

  update(current: Apartment, updates: UpdateApartmentRequest): Apartment {
    const merged = { ...current, ...updates };
    const [isValid, errors] = validateApartment(merged);
    if (!isValid) {
      throw new Error(`아파트 업데이트 실패: ${errors.join(", ")}`);
    }

    return {
      ...merged,
      updatedAt: new Date(),
      version: (current.version ?? 0) + 1,
    };
  },

  assignAdmin(apartment: Apartment, admin: AdminUser): Apartment {
    return {
      ...apartment,
      adminId: admin.id,
      admin,
    };
  },

  removeAdmin(apartment: Apartment): Apartment {
    return {
      ...apartment,
      adminId: undefined,
      admin: undefined,
    };
  },

  getDetail(apartment: Apartment): Apartment & {
    buildings: number[];
    units: number[];
  } {
    return {
      ...apartment,
      buildings: generateBuildings(
        apartment.buildingNumberFrom,
        apartment.buildingNumberTo,
      ),
      units: generateUnits(
        apartment.floorCountPerBuilding,
        apartment.unitCountPerFloor,
      ),
    };
  },

  getDetailList(apartments: Apartment[]): Array<
    Apartment & {
      buildings: number[];
      units: number[];
    }
  > {
    return apartments.map((apartment) => ApartmentEntity.getDetail(apartment));
  },

  getSummary(apartment: Apartment): Omit<Apartment, "admin"> {
    const { admin, ...summary } = apartment;
    return summary;
  },

  getSummaryList(apartments: Apartment[]): Array<Omit<Apartment, "admin">> {
    return apartments.map((apartment) => ApartmentEntity.getSummary(apartment));
  },

  validate(apartment: Apartment): [boolean, string?] {
    if (!validateFloorCount(apartment.floorCountPerBuilding)) {
      return [false, "층 수가 유효하지 않습니다"];
    }

    if (!validateUnitCount(apartment.unitCountPerFloor)) {
      return [false, "호수가 유효하지 않습니다"];
    }

    if (
      !validateBuildingRange(
        apartment.buildingNumberFrom,
        apartment.buildingNumberTo,
      )
    ) {
      return [false, "건물 번호 범위가 유효하지 않습니다"];
    }

    return [true];
  },
};
