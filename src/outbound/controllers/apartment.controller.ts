import { Request, Response } from "express";
import { z } from "zod";
import {
  createGetApartmentsService,
  GetApartmentsOutput,
} from "../../application/services/get-apartment.services";
import { ApartmentRepository } from "../repositories/apartment.repository";

const GetApartmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  searchKeyword: z.string().optional(),
});

type ApiResponse<T> = {
  readonly statusCode: number;
  readonly data: T;
  readonly message: string;
};

export const createGetApartmentsController = (repo: ApartmentRepository) => {
  return async (
    req: Request,
    res: Response<ApiResponse<GetApartmentsOutput>>,
  ): Promise<void> => {
    const query = GetApartmentsQuerySchema.parse(req.query);
    const service = createGetApartmentsService(repo);

    const result = await service({
      page: query.page,
      limit: query.limit,
      searchKeyword: query.searchKeyword,
    });

    res.status(200).json({
      statusCode: 200,
      data: result,
      message: "아파트 목록 조회 성공",
    });
  };
};
