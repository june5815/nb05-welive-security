import express, { Router } from "express";
import { ApartmentsController } from "./controller";
import { ApartmentsService } from "./service/apartments.service";
import { ApartmentQueryRepository } from "../../_common/ports/repos/apartment/apartment-query-repo.interface";

/**
 * Apartment 모듈 라우트 정의
 * => 해당 모듈의 라우트만 정의합니다.
 * => "apartment 모듈 내부에서 어떤 엔드포인트가 필요할까?"에만 초점을 둔 라우트 파일
 *
 * 엔드포인트:
 * GET / - 아파트 목록 조회
 * GET /:id - 아파트 상세 조회
 */
export const createApartmentRoutes = (
  apartmentRepo: ApartmentQueryRepository,
): Router => {
  const router = Router();

  // 의존성 설정
  const apartmentService = new ApartmentsService(apartmentRepo);
  const apartmentController = new ApartmentsController(apartmentService);

  // ===== 라우트 정의 =====

  /**
   * GET /
   * 아파트 목록 조회
   * 최종 경로: GET /api/v2/apartments
   */
  router.get("/", (req, res) => apartmentController.listApartments(req, res));

  /**
   * GET /:id
   * 아파트 상세 조회
   * 최종 경로: GET /api/v2/apartments/{id}
   * 예: GET /api/v2/apartments/123
   */
  router.get("/:id", (req, res) =>
    apartmentController.getApartmentDetail(req, res),
  );

  return router;
};
