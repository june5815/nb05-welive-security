import { Request, Response } from "express";
import { ApartmentsService } from "./service/apartments.service";
import {
  ApartmentListResponse,
  ApartmentDetailResponse,
} from "./dtos/apartment.dto";

export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  /**
   * 아파트 목록 조회
   * GET /api/v2/apartments
   */
  async listApartments(req: Request, res: Response): Promise<void> {
    try {
      const response: ApartmentListResponse =
        await this.apartmentsService.listApartments();
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
      const response: ApartmentDetailResponse =
        await this.apartmentsService.getApartmentDetail(id);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "아파트를 찾을 수 없습니다.",
      });
    }
  }
}
