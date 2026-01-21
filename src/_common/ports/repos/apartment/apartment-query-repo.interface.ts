import { Apartment } from "../../../../_modules/apartments/domain/apartment.entity";

export interface IApartmentQueryRepo {
  findAll(): Promise<Required<Apartment>[]>;
  findById(id: string): Promise<Required<Apartment> | null>;
  search(query: string): Promise<Required<Apartment>[]>;
  findByAddress(address: string): Promise<Required<Apartment> | null>;
  findByAdminId(adminId: string): Promise<Required<Apartment>[]>;
  findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: Required<Apartment>[];
    total: number;
    page: number;
    limit: number;
  }>;
}

export type ApartmentQueryRepository = IApartmentQueryRepo;
