import { Apartment } from "../../../../_modules/apartments/domain/apartment.entity";

export interface IApartmentRepo {
  findAll(): Promise<Required<Apartment>[]>;
  findById(id: string): Promise<Required<Apartment> | null>;
  search(query: string): Promise<Required<Apartment>[]>;
  findByAddress(address: string): Promise<Required<Apartment> | null>;
  findByAdminId(adminId: string): Promise<Required<Apartment> | null>;
  findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: Required<Apartment>[];
    total: number;
    page: number;
    limit: number;
  }>;

  save(apartment: Apartment): Promise<Required<Apartment>>;
  delete(id: string): Promise<void>;
}
