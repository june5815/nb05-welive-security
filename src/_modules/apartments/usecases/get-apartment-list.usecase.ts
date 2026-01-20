import { Apartment } from "../domain/apartment.entity";
import { ApartmentQueryRepository } from "../ports/apartment-query-repo.interface";

/**
 * 건물번호 배열 생성
 * 예: from=101, to=105 => [101, 102, 103, 104, 105]
 */
const generateBuildingNumbers = (from: number, to: number): number[] => {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
};

const generateUnitNumbers = (
  buildingFrom: number,
  buildingTo: number,
  floorCount: number,
  unitPerFloor: number,
): number[] => {
  const units: number[] = [];
  for (let b = buildingFrom; b <= buildingTo; b++) {
    for (let f = 1; f <= floorCount; f++) {
      for (let u = 1; u <= unitPerFloor; u++) {
        units.push(Number(`${b}${String(f).padStart(2, "0")}${u}`));
      }
    }
  }
  return units;
};

/**
 * 아파트 정보를 공개용 DTO로 변환
 */
const mapToPublicDto = (apartment: Apartment) => ({
  id: apartment.id,
  name: apartment.name,
  address: apartment.address,
  description: apartment.description,
  officeNumber: apartment.officeNumber,
  buildings: generateBuildingNumbers(
    apartment.buildingNumberFrom,
    apartment.buildingNumberTo,
  ),
  units: generateUnitNumbers(
    apartment.buildingNumberFrom,
    apartment.buildingNumberTo,
    apartment.floorCountPerBuilding,
    apartment.unitCountPerFloor,
  ),
});

// DTO 타입 정의
export interface ApartmentListItemDto {
  id?: string;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  buildings: number[];
  units: number[];
}

export interface ApartmentListResponseDto {
  data: ApartmentListItemDto[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export const getApartmentList = async (
  apartmentRepo: ApartmentQueryRepository,
  page: number = 0,
  limit: number = 10,
  search?: string,
): Promise<ApartmentListResponseDto> => {
  const result = await apartmentRepo.findWithPagination(page, limit);

  // 검색 쿼리가 있으면 필터링
  let apartments = result.data;
  if (search) {
    const searchResults = await apartmentRepo.search(search);
    apartments = searchResults;
  }

  const publicDto = apartments.map(mapToPublicDto);

  return {
    data: publicDto,
    total: result.total,
    page: result.page,
    limit: result.limit,
    hasNext: page * limit + limit < result.total,
  };
};
