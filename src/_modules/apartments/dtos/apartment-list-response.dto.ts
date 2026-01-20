export interface ApartmentSingleDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  buildingNumberFrom: number;
  buildingNumberTo: number;
  floorCountPerBuilding: number;
  unitCountPerFloor: number;
  adminId: string;
  buildings: number[];
  units: number[];
}

export interface ApartmentListDto {
  id: string;
  name: string;
  address: string;
  description?: string;
  officeNumber: string;
  buildings: number[];
  units: number[];
}

export interface PaginatedApartmentListDto {
  data: ApartmentListDto[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface ApartmentListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}
