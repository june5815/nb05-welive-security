import { ApartmentQueryRepository } from "../ports/apartment-query-repo.interface";
import { ApartmentEntity } from "../domain/apartment.entity";
import { ApartmentDetailResponse } from "../dtos/apartment.dto";

export class GetApartmentDetailUseCase {
  constructor(private readonly apartmentRepo: ApartmentQueryRepository) {}

  async execute(id: string): Promise<ApartmentDetailResponse> {
    const raw = await this.apartmentRepo.findById(id);

    if (!raw) {
      throw new Error(`아파트를 찾을 수 없습니다. ID: ${id}`);
    }

    const apartment = ApartmentEntity.restore(raw);
    const detailed = ApartmentEntity.getDetail(apartment);
    const response: ApartmentDetailResponse = {
      id: detailed.id as string,
      name: detailed.name,
      address: detailed.address,
      description: detailed.description,
      officeNumber: detailed.officeNumber,
      buildings: detailed.buildings,
      units: detailed.units,
    };

    return response;
  }
}
