import { Apartment as ApartmentPrisma } from "@prisma/client";
import { Apartment } from "../../_modules/apartments/domain/apartment.entity";
import { generateId } from "../../_common/utils/id-generator.util";

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
}
