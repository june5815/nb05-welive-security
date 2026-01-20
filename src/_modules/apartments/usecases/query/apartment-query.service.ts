import { ApartmentQueryRepository } from "../../../../_common/ports/repos/apartment";
import { Apartment, ApartmentEntity } from "../../domain/apartment.entity";
import {
  ApartmentListResponse,
  ApartmentDetailResponse,
} from "../../dtos/apartment.dto";

export class ApartmentQueryService {
  constructor(private readonly apartmentQueryRepo: ApartmentQueryRepository) {}

  async getAllApartments(): Promise<ApartmentListResponse> {
    const rawApartments = await this.apartmentQueryRepo.findAll();
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

  async getApartmentById(id: string): Promise<ApartmentDetailResponse> {
    const raw = await this.apartmentQueryRepo.findById(id);

    if (!raw) {
      throw new Error(`아파트를 찾을 수 없습니다. ID: ${id}`);
    }
    const apartment = ApartmentEntity.restore(raw);

    const detailed = ApartmentEntity.getDetail(apartment);
    return {
      id: detailed.id as string,
      name: detailed.name,
      address: detailed.address,
      description: detailed.description,
      officeNumber: detailed.officeNumber,
      buildings: detailed.buildings,
      units: detailed.units,
    };
  }

  async searchApartments(query: string): Promise<ApartmentListResponse> {
    const rawApartments = await this.apartmentQueryRepo.search(query);
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
