import { ApartmentEntity } from "../../command/entities/apartment/apartment.entity";

export interface IApartmentRepo {
  findById(id: string): Promise<ApartmentEntity | null>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: ApartmentEntity[];
    totalCount: number;
  }>;

  create(apartment: ApartmentEntity): Promise<ApartmentEntity>;
  update(
    id: string,
    apartment: Partial<ApartmentEntity>,
  ): Promise<ApartmentEntity>;
}
