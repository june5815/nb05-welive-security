/**
 * Response Mapper
 *
 * API 응답을 통일된 형식으로 변환합니다.
 * 모든 응답이 일관된 구조를 유지하도록 관리합니다.
 */

interface SuccessResponse<T> {
  status: number;
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  status: number;
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export const ResponseMapper = {
  /**
   * 아파트 목록 조회 성공 응답
   */
  listApartmentsSuccess<T>(data: T): SuccessResponse<T> {
    return {
      status: 200,
      success: true,
      data,
      message: "아파트 목록 조회 성공",
    };
  },

  /**
   * 아파트 상세 조회 성공 응답
   */
  getApartmentDetailSuccess<T>(data: T): SuccessResponse<T> {
    return {
      status: 200,
      success: true,
      data,
      message: "아파트 상세 조회 성공",
    };
  },

  /**
   * 아파트를 찾을 수 없음 응답
   */
  apartmentNotFound(id: string): ErrorResponse {
    return {
      status: 404,
      success: false,
      error: {
        message: `아파트를 찾을 수 없습니다. ID: ${id}`,
        code: "APARTMENT_NOT_FOUND",
      },
    };
  },

  /**
   * 내부 서버 에러 응답
   */
  internalServerError(error: any): ErrorResponse {
    const message =
      error instanceof Error ? error.message : "내부 서버 에러가 발생했습니다.";

    return {
      status: 500,
      success: false,
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
      },
    };
  },

  /**
   * 요청 검증 실패 응답
   */
  validationError(message: string): ErrorResponse {
    return {
      status: 400,
      success: false,
      error: {
        message,
        code: "VALIDATION_ERROR",
      },
    };
  },

  /**
   * 권한 없음 응답
   */
  unauthorized(): ErrorResponse {
    return {
      status: 401,
      success: false,
      error: {
        message: "인증이 필요합니다.",
        code: "UNAUTHORIZED",
      },
    };
  },

  /**
   * 금지됨 응답
   */
  forbidden(): ErrorResponse {
    return {
      status: 403,
      success: false,
      error: {
        message: "접근 권한이 없습니다.",
        code: "FORBIDDEN",
      },
    };
  },
};
