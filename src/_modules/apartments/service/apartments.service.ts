import {
  getApartmentList,
  ApartmentListResponseDto,
} from "../usecases/get-apartment-list.usecase";
import { Apartment } from "../domain/apartment.entity";
import { ApartmentQueryRepository } from "../../../_common/ports/repos/apartment/apartment-query-repo.interface";

export class ApartmentsService {
  constructor(private readonly apartmentRepo: ApartmentQueryRepository) {}

  async listApartments(
    page: number = 0,
    limit: number = 10,
    search?: string,
  ): Promise<ApartmentListResponseDto> {
    return getApartmentList(this.apartmentRepo, page, limit, search);
  }

  async getApartmentDetail(id: string): Promise<Required<Apartment> | null> {
    return this.apartmentRepo.findById(id);
  }
}
