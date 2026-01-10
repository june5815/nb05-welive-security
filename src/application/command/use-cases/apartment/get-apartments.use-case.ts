import { ApartmentRepository } from "../../../../outbound/repositories/apartment.repository";
import {
  ApartmentEntity,
  ApartmentDTO,
  toDTO,
} from "../../../command/entities/apartment/apartment.entity";

export type GetApartmentsInput = {
  readonly page: number;
  readonly limit: number;
};

export type GetApartmentsOutput = {
  readonly apartments: ApartmentDTO[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export const createGetApartmentsUseCase = (repo: ApartmentRepository) => {
  return async (input: GetApartmentsInput): Promise<GetApartmentsOutput> => {
    const result = await repo.findAll(input.page, input.limit);

    const apartments = result.data.map(toDTO);
    const totalPages = Math.ceil(result.totalCount / input.limit);

    return {
      apartments,
      totalCount: result.totalCount,
      page: input.page,
      limit: input.limit,
      totalPages,
    };
  };
};
