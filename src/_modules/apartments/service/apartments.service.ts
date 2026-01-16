import { ApartmentQueryRepository } from "../ports/apartment-query-repo.interface";
import { ListApartmentsUseCase } from "../usecases/list-apartments.uc";
import { GetApartmentDetailUseCase } from "../usecases/getApartmentDetail.uc";
import {
  ApartmentListResponse,
  ApartmentDetailResponse,
} from "../dtos/apartment.dto";

export class ApartmentsService {
  private readonly listApartmentsUseCase: ListApartmentsUseCase;
  private readonly getApartmentDetailUseCase: GetApartmentDetailUseCase;

  constructor(private readonly apartmentRepo: ApartmentQueryRepository) {
    this.listApartmentsUseCase = new ListApartmentsUseCase(apartmentRepo);
    this.getApartmentDetailUseCase = new GetApartmentDetailUseCase(
      apartmentRepo,
    );
  }

  async listApartments(): Promise<ApartmentListResponse> {
    return this.listApartmentsUseCase.execute();
  }

  async getApartmentDetail(id: string): Promise<ApartmentDetailResponse> {
    return this.getApartmentDetailUseCase.execute(id);
  }
}
