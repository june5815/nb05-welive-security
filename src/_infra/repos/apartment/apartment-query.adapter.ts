import { IApartmentQueryRepo } from "../../../_common/ports/repos/apartment/apartment-query-repo.interface";
import { Apartment } from "../../../_modules/apartments/domain/apartment.entity";

export class ApartmentQueryAdapter implements IApartmentQueryRepo {
  constructor(private repo: IApartmentQueryRepo) {}

  async findAll(): Promise<Required<Apartment>[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<Required<Apartment> | null> {
    return this.repo.findById(id);
  }

  async search(query: string): Promise<Required<Apartment>[]> {
    return this.repo.search(query);
  }

  async findByAddress(address: string): Promise<Required<Apartment> | null> {
    return this.repo.findByAddress(address);
  }

  async findByAdminId(adminId: string): Promise<Required<Apartment>[]> {
    return this.repo.findByAdminId(adminId);
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
    return this.repo.findWithPagination(page, limit);
  }
}
