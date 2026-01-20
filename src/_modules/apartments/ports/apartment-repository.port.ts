import { Apartment } from "../domain/apartment.entity";

export interface ApartmentListQuery {
  readonly page: number;
  readonly limit: number;
  readonly search?: string;
}

export interface ApartmentListResult {
  readonly data: readonly Apartment[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

export interface IApartmentRepoPort {
  findAll(options: ApartmentListQuery): Promise<ApartmentListResult>;
  findById(id: string): Promise<Apartment | null>;
  findByAdminId(adminId: string): Promise<Apartment | null>;
  save(apartment: Apartment): Promise<Apartment>;
  delete(id: string): Promise<void>;
}
