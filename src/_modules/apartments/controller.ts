import { Request, Response } from "express";
import { ApartmentsService } from "./service/apartments.service";
import { ApartmentListResponseDto } from "./usecases/get-apartment-list.usecase";

export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  /**
   * 아파트 목록 조회
   * GET /api/v2/apartments
   */
  async listApartments(req: Request, res: Response): Promise<void> {
    try {
      const { page = 0, limit = 10, search } = req.query;
      const response: ApartmentListResponseDto =
        await this.apartmentsService.listApartments(
          Number(page),
          Number(limit),
          search ? String(search) : undefined,
        );
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "내부 서버 에러",
      });
    }
  }

  /**
   * 아파트 상세 조회
   * GET /api/v2/apartments/:id
   */
  async getApartmentDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      res.status(200).json({
        success: true,
        message: "아파트 상세 조회 성공",
        data: { id },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "아파트를 찾을 수 없습니다.",
      });
    }
  }
}
