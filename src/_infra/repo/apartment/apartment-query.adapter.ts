import { ApartmentQueryRepository } from "../../../_common/ports/repos/apartment/apartment-query-repo.interface";
import { IApartmentRepo } from "../../../_common/ports/repos/apartment/apartment-repo.interface";
import { Apartment } from "../../../_modules/apartments/domain/apartment.entity";
import { ApartmentMapper } from "../../mapper/apartment.mapper";

/**
 * IApartmentRepo를 ApartmentQueryRepository로 변환 어댑터
 * 도메인 모델의 요구사항에 맞춰 인프라 레포지토리
 */
export class ApartmentQueryAdapter implements ApartmentQueryRepository {
  constructor(private repo: IApartmentRepo) {}

  async findAll(): Promise<Required<Apartment>[]> {
    const apartments = await this.repo.findAll();
    return apartments;
  }

  async findById(id: string): Promise<Required<Apartment> | null> {
    const apartment = await this.repo.findById(id);
    if (!apartment) return null;
    return apartment;
  }

  async search(query: string): Promise<Required<Apartment>[]> {
    const apartments = await this.repo.search(query);
    return apartments;
  }

  async findByAddress(address: string): Promise<Required<Apartment> | null> {
    const apartment = await this.repo.findByAddress(address);
    if (!apartment) return null;
    return apartment;
  }

  async findByAdminId(adminId: string): Promise<Required<Apartment>[]> {
    const apartment = await this.repo.findByAdminId(adminId);
    if (!apartment) return [];
    return [apartment];
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
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
