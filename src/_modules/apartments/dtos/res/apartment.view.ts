export interface ApartmentListResView {
  readonly data: ApartmentListItemResView[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

export interface ApartmentListItemResView {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildings: number[];
  readonly units: number[];
}

export interface ApartmentDetailResView {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly buildings: number[];
  readonly units: number[];
  readonly unitCountPerFloor: number;
  readonly totalUnits: number;
  readonly buildingCount: number;
  readonly householdCountPerBuilding: number;
  readonly admin?: {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly email: string;
    readonly contact: string;
  } | null;
}
