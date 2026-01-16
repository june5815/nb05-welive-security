import { ApartmentQueryRepository } from "../ports/apartment-query-repo.interface";
import { ApartmentEntity } from "../domain/apartment.entity";
import { ApartmentListResponse } from "../dtos/apartment.dto";

export class ListApartmentsUseCase {
  constructor(private readonly apartmentRepo: ApartmentQueryRepository) {}

  async execute(): Promise<ApartmentListResponse> {
    const rawApartments = await this.apartmentRepo.findAll();
    const apartments = rawApartments.map((raw) => ApartmentEntity.restore(raw));
    const detailedApartments = apartments.map((apt) =>
      ApartmentEntity.getDetail(apt),
    );
    const listItems = detailedApartments.map((apt) => ({
      id: apt.id as string,
      name: apt.name,
      address: apt.address,
      description: apt.description,
      officeNumber: apt.officeNumber,
      buildingNumberFrom: apt.buildingNumberFrom,
      buildingNumberTo: apt.buildingNumberTo,
      floorCountPerBuilding: apt.floorCountPerBuilding,
      unitCountPerFloor: apt.unitCountPerFloor,
      buildings: apt.buildings,
      units: apt.units,
      createdAt: apt.createdAt as Date,
      updatedAt: apt.updatedAt as Date,
    }));

    return {
      data: listItems,
    };
  }
}
