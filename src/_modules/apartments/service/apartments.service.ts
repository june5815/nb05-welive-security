import { ApartmentQueryRepository } from "../ports/apartment-query-repo.interface";
import {
  getApartmentList,
  ApartmentListResponseDto,
} from "../usecases/get-apartment-list.usecase";

export class ApartmentsService {
  constructor(private readonly apartmentRepo: ApartmentQueryRepository) {}

  async listApartments(
    page: number = 0,
    limit: number = 10,
    search?: string,
  ): Promise<ApartmentListResponseDto> {
    return getApartmentList(this.apartmentRepo, page, limit, search);
  }
}
