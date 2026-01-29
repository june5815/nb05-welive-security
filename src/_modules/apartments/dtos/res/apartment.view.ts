/**
 * 목록 항목
 */
export interface ApartmentListItemResView {
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
  readonly unitCountPerFloor: number;
  readonly totalUnits: number;
  readonly adminId?: string | null;
}

/**
 * 목록 조회 (페이지네이션))
 */
export interface ApartmentListResView {
  readonly data: ApartmentListItemResView[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

/**
 * 상세 조회
 */
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
