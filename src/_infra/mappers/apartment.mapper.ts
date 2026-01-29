import { Apartment as ApartmentPrisma } from "@prisma/client";
import { Apartment } from "../../_modules/apartments/domain/apartment.entity";
import { generateId } from "../../_common/utils/id-generator.util";
import { ApartmentEntity } from "../../_modules/apartments/domain/apartment.entity";
import {
  ApartmentDetailResView,
  ApartmentListResView,
} from "../../_modules/apartments/dtos/res/apartment.view";

export class ApartmentMapper {
  static toDomain(raw: ApartmentPrisma): Apartment {
    return {
      id: raw.id,
      name: raw.name,
      address: raw.address,
      description: raw.description,
      officeNumber: raw.officeNumber,
      adminId: raw.adminId || undefined,
      buildingNumberFrom: raw.buildingNumberFrom,
      buildingNumberTo: raw.buildingNumberTo,
      floorCountPerBuilding: raw.floorCountPerBuilding,
      unitCountPerFloor: raw.unitCountPerFloor,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toPersistenceCreate(
    entity: Apartment,
  ): Omit<ApartmentPrisma, "createdAt" | "updatedAt" | "version"> {
    return {
      id: entity.id || generateId(),
      name: entity.name,
      address: entity.address,
      description: entity.description,
      officeNumber: entity.officeNumber,
      adminId: entity.adminId || null,
      buildingNumberFrom: entity.buildingNumberFrom,
      buildingNumberTo: entity.buildingNumberTo,
      floorCountPerBuilding: entity.floorCountPerBuilding,
      unitCountPerFloor: entity.unitCountPerFloor,
    };
  }

  static toPersistenceUpdate(
    entity: Apartment,
  ): Omit<ApartmentPrisma, "createdAt" | "updatedAt" | "version" | "id"> {
    return {
      name: entity.name,
      address: entity.address,
      description: entity.description,
      officeNumber: entity.officeNumber,
      adminId: entity.adminId || null,
      buildingNumberFrom: entity.buildingNumberFrom,
      buildingNumberTo: entity.buildingNumberTo,
      floorCountPerBuilding: entity.floorCountPerBuilding,
      unitCountPerFloor: entity.unitCountPerFloor,
    };
  }

  static toPersistence(entity: Apartment): Partial<ApartmentPrisma> {
    const base = {
      name: entity.name,
      address: entity.address,
      description: entity.description,
      officeNumber: entity.officeNumber,
      adminId: entity.adminId || null,
      buildingNumberFrom: entity.buildingNumberFrom,
      buildingNumberTo: entity.buildingNumberTo,
      floorCountPerBuilding: entity.floorCountPerBuilding,
      unitCountPerFloor: entity.unitCountPerFloor,
    };

    if (entity.id) {
      return {
        id: entity.id,
        ...base,
      };
    }

    return {
      id: generateId(),
      ...base,
    };
  }

  static toListPresentation(
    apartments: (ApartmentPrisma & { admin: any | null })[],
    totalCount: number,
    page: number,
    limit: number,
  ): ApartmentListResView {
    const data = apartments.map((apartment) => {
      const { admin, ...apartmentWithoutAdmin } = apartment;
      return {
        ...apartment,
        totalUnits: ApartmentEntity.getTotalUnits(apartmentWithoutAdmin),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  }

  static toDetailPresentation(
    apartment: ApartmentPrisma & { admin: any | null },
  ): ApartmentDetailResView {
    const { admin, ...apartmentWithoutAdmin } = apartment;
    return {
      ...apartment,
      totalUnits: ApartmentEntity.getTotalUnits(apartmentWithoutAdmin),
      buildingCount: ApartmentEntity.getBuildingCount(apartmentWithoutAdmin),
      householdCountPerBuilding: ApartmentEntity.getHouseholdCountPerBuilding(
        apartmentWithoutAdmin,
      ),
    };
  }

  static toDetailPresentationArray(
    apartments: (ApartmentPrisma & { admin: any | null })[],
  ): ApartmentDetailResView[] {
    return apartments.map((apartment) => this.toDetailPresentation(apartment));
  }
}
