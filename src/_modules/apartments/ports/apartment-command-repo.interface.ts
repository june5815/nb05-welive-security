import { Apartment } from "../domain/apartment.entity";

export type CreateApartmentCommand = Readonly<{
  id: string;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  adminId?: string;
  buildingNumberFrom: number;
  buildingNumberTo: number;
  floorCountPerBuilding: number;
  unitCountPerFloor: number;
}>;

export type UpdateApartmentCommand = Readonly<{
  id: string;
  name?: string;
  address?: string;
  description?: string;
  officeNumber?: string;
  adminId?: string;
}>;

export type ApartmentCommandResult = Readonly<{
  apartment: Apartment;
}>;

export interface IApartmentCommandRepo {
  create(command: CreateApartmentCommand): Promise<Apartment>;
  update(command: UpdateApartmentCommand): Promise<Apartment>;
  delete(id: string): Promise<void>;
}
