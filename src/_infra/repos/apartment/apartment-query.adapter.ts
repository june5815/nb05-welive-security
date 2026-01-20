import { ApartmentQueryRepository } from "../../../_modules/apartments/ports/apartment-query-repo.interface";
import { Apartment } from "../../../_modules/apartments/domain/apartment.entity";
import { IApartmentRepo } from "./apartment.repo";
import { ApartmentMapper } from "../../mappers/apartment.mapper";

/**
 * IApartmentRepo를 ApartmentQueryRepository로 변환하는 어댑터
 * 도메인 모델의 요구사항에 맞춰 인프라 레포지토리로
 */
export class ApartmentQueryAdapter implements ApartmentQueryRepository {
  constructor(private repo: IApartmentRepo) {}

  async findAll(): Promise<Required<Apartment>[]> {
    const apartments = await this.repo.findAll();
    return apartments.map((apt) =>
      ApartmentMapper.toDomain(apt),
    ) as Required<Apartment>[];
  }

  async findById(id: string): Promise<Required<Apartment> | null> {
    const apartment = await this.repo.findById(id);
    if (!apartment) return null;
    return ApartmentMapper.toDomain(apartment) as Required<Apartment>;
  }

  async search(query: string): Promise<Required<Apartment>[]> {
    const apartments = await this.repo.search(query);
    return apartments.map((apt) =>
      ApartmentMapper.toDomain(apt),
    ) as Required<Apartment>[];
  }

  async findByAddress(address: string): Promise<Required<Apartment> | null> {
    const apartment = await this.repo.findByAddress(address);
    if (!apartment) return null;
    return ApartmentMapper.toDomain(apartment) as Required<Apartment>;
  }

  async findByAdminId(adminId: string): Promise<Required<Apartment>[]> {
    const apartment = await this.repo.findByAdminId(adminId);
    if (!apartment) return [];
    return [ApartmentMapper.toDomain(apartment)] as Required<Apartment>[];
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: Required<Apartment>[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.repo.findWithPagination(page, limit);
    return {
      data: result.data.map((apt) =>
        ApartmentMapper.toDomain(apt),
      ) as Required<Apartment>[],
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
