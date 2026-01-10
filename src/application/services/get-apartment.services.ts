import { ApartmentRepository } from "../../outbound/repositories/apartment.repository";
import {
  ApartmentDTO,
  toDTO,
} from "../command/entities/apartment/apartment.entity";

export type GetApartmentsInput = {
  readonly page: number;
  readonly limit: number;
  readonly searchKeyword?: string;
};

export type GetApartmentsOutput = {
  readonly data: ApartmentDTO[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
};

export const createGetApartmentsService = (repo: ApartmentRepository) => {
  return async (input: GetApartmentsInput): Promise<GetApartmentsOutput> => {
    const result = await repo.findAll(
      input.page,
      input.limit,
      input.searchKeyword,
    );

    const apartments = result.data.map(toDTO);
    const hasNext = input.page * input.limit < result.totalCount;

    return {
      data: apartments,
      totalCount: result.totalCount,
      page: input.page,
      limit: input.limit,
      hasNext,
    };
  };
};
