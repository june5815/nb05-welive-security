export interface ApartmentListItemResponse {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
  readonly buildings: number[];
  readonly units: number[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ApartmentListResponse {
  readonly data: readonly ApartmentListItemResponse[];
}

export interface ApartmentDetailResponse {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildings: number[];
  readonly units: number[];
}

export interface CreateApartmentRequestDto {
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

export interface UpdateApartmentRequestDto {
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

export interface ApartmentCreateUpdateResponse {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildings: number[];
  readonly units: number[];
}
