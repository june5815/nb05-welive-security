import { Apartment } from "../../../../_modules/apartments/domain/apartment.entity";

export interface IApartmentCommandRepo {
  save(apartment: Apartment): Promise<Required<Apartment>>;
  delete(id: string): Promise<void>;
  updateAdminId(
    apartmentId: string,
    adminId: string | null,
  ): Promise<Required<Apartment>>;
  deleteMany(apartmentIds: string[]): Promise<number>;
}
