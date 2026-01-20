import { ApartmentQueryService } from "./apartment-query.service";
import { ApartmentListResponse } from "../../../../application/dto/apartment/apartment.dto";

export interface GetApartmentsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
}

export class GetApartmentsListHandler {
  constructor(private readonly apartmentQueryService: ApartmentQueryService) {}

  async execute(query?: GetApartmentsQuery): Promise<ApartmentListResponse> {
    try {
      if (query?.search) {
        return await this.apartmentQueryService.searchApartments(query.search);
      }
      return await this.apartmentQueryService.getAllApartments();
    } catch (error) {
      throw new Error(
        `아파트 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export class GetApartmentDetailHandler {
  constructor(private readonly apartmentQueryService: ApartmentQueryService) {}

  async execute(id: string) {
    try {
      return await this.apartmentQueryService.getApartmentById(id);
    } catch (error) {
      throw new Error(
        `아파트 상세 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
