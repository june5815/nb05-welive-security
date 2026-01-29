/**
 * HTTP 에러 정의 및 처리
 * 도메인 특화 에러 (DomainError) 포함
 */

// ==================== Error Types ====================

// 비즈니스 로직 에러 타입
export enum BusinessErrorType {
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_AUTH = "INVALID_AUTH",
  UNAUTHORIZED_REQUEST = "UNAUTHORIZED_REQUEST",
  FORBIDDEN = "FORBIDDEN",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  EMAIL_REQUIRED = "EMAIL_REQUIRED",
  INVALID_EMAIL = "INVALID_EMAIL",
  PASSWORD_REQUIRED = "PASSWORD_REQUIRED",
  PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  NICKNAME_DUPLICATE = "NICKNAME_DUPLICATE",
  NICKNAME_TOO_LONG = "NICKNAME_TOO_LONG",
  NOTICE_NOT_FOUND = "NOTICE_NOT_FOUND",
  NOTICE_TITLE_REQUIRED = "NOTICE_TITLE_REQUIRED",
  NOTICE_CONTENT_REQUIRED = "NOTICE_CONTENT_REQUIRED",
  COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND",
  COMMENT_CONTENT_REQUIRED = "COMMENT_CONTENT_REQUIRED",
  COMPLAINT_TITLE_REQUIRED = "COMPLAINT_TITLE_REQUIRED",
  COMPLAINT_CONTENT_REQUIRED = "COMPLAINT_CONTENT_REQUIRED",
  ALREADY_LIKED = "ALREADY_LIKED",
  TOO_MANY_POST = "TOO_MANY_POST",
  CONTENT_TOO_LONG = "CONTENT_TOO_LONG",
  PARSE_BODY_ERROR = "PARSE_BODY_ERROR",
  ARTICLE_NOT_FOUND = "ARTICLE_NOT_FOUND",
  INVALID_EVENT_DATE = "INVALID_EVENT_DATE",
  UNKNOWN_SERVER_ERROR = "UNKNOWN_SERVER_ERROR",
}

// 기술적 에러 타입 (DB, 외부 API 등)
export enum TechnicalErrorType {
  // 데이터베이스 에러
  OPTIMISTIC_LOCK_FAILED = "OPTIMISTIC_LOCK_FAILED",
  UNIQUE_VIOLATION = "UNIQUE_VIOLATION",
  UNIQUE_VIOLATION_USERNAME = "UNIQUE_VIOLATION_USERNAME",
  UNIQUE_VIOLATION_EMAIL = "UNIQUE_VIOLATION_EMAIL",
  UNIQUE_VIOLATION_CONTACT = "UNIQUE_VIOLATION_CONTACT",
  UNIQUE_VIOLATION_NICKNAME = "UNIQUE_VIOLATION_NICKNAME",

  // 외부 서비스 에러
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  EXTERNAL_API_BAD_REQUEST = "EXTERNAL_API_BAD_REQUEST",
  EXTERNAL_API_TIMEOUT = "EXTERNAL_API_TIMEOUT",

  // 기타 기술적 에러
  DATABASE_ERROR = "DATABASE_ERROR",
  DATA_NOT_FOUND = "DATA_NOT_FOUND",
}

// ==================== Error Mapping ====================

// 에러 타입별 상태 코드 및 메시지 매핑
const ErrorTable: Record<
  BusinessErrorType,
  { statusCode: number; message: string }
> = {
  // 인증 관련
  [BusinessErrorType.TOKEN_EXPIRED]: {
    statusCode: 401,
    message: "토큰이 만료되었습니다.",
  },
  [BusinessErrorType.INVALID_AUTH]: {
    statusCode: 401,
    message: "이메일 또는 비밀번호가 일치하지 않습니다.",
  },
  [BusinessErrorType.UNAUTHORIZED_REQUEST]: {
    statusCode: 401,
    message: "권한이 없습니다.",
  },
  [BusinessErrorType.FORBIDDEN]: {
    statusCode: 403,
    message: "접근 권한이 없습니다.",
  },

  // 사용자 관련
  [BusinessErrorType.USER_NOT_FOUND]: {
    statusCode: 404,
    message: "사용자를 찾을 수 없습니다.",
  },
  [BusinessErrorType.DUPLICATE_EMAIL]: {
    statusCode: 409,
    message: "이미 존재하는 이메일입니다.",
  },
  [BusinessErrorType.EMAIL_REQUIRED]: {
    statusCode: 400,
    message: "이메일을 입력해주세요.",
  },
  [BusinessErrorType.INVALID_EMAIL]: {
    statusCode: 400,
    message: "이메일 형식이 올바르지 않습니다.",
  },
  [BusinessErrorType.PASSWORD_REQUIRED]: {
    statusCode: 400,
    message: "비밀번호를 입력해주세요.",
  },
  [BusinessErrorType.PASSWORD_TOO_SHORT]: {
    statusCode: 400,
    message: "비밀번호는 최소 8자 이상이어야 합니다.",
  },
  [BusinessErrorType.INVALID_PASSWORD]: {
    statusCode: 401,
    message: "비밀번호가 일치하지 않습니다.",
  },
  [BusinessErrorType.NICKNAME_DUPLICATE]: {
    statusCode: 409,
    message: "이미 사용 중인 닉네임입니다.",
  },
  [BusinessErrorType.NICKNAME_TOO_LONG]: {
    statusCode: 400,
    message: "닉네임은 최대 20자까지 가능합니다.",
  },

  // 콘텐츠 관련
  [BusinessErrorType.NOTICE_NOT_FOUND]: {
    statusCode: 404,
    message: "공지사항을 찾을 수 없습니다.",
  },
  [BusinessErrorType.NOTICE_TITLE_REQUIRED]: {
    statusCode: 400,
    message: "공지사항 제목은 필수입니다.",
  },
  [BusinessErrorType.NOTICE_CONTENT_REQUIRED]: {
    statusCode: 400,
    message: "공지사항 내용은 필수입니다.",
  },
  [BusinessErrorType.COMMENT_NOT_FOUND]: {
    statusCode: 404,
    message: "댓글을 찾을 수 없습니다.",
  },
  [BusinessErrorType.COMMENT_CONTENT_REQUIRED]: {
    statusCode: 400,
    message: "댓글 내용은 필수입니다.",
  },
  [BusinessErrorType.COMPLAINT_TITLE_REQUIRED]: {
    statusCode: 400,
    message: "민원 제목은 필수입니다.",
  },
  [BusinessErrorType.COMPLAINT_CONTENT_REQUIRED]: {
    statusCode: 400,
    message: "민원 내용은 필수입니다.",
  },

  // 기타
  [BusinessErrorType.ALREADY_LIKED]: {
    statusCode: 400,
    message: "이미 좋아요를 눌렀습니다.",
  },
  [BusinessErrorType.TOO_MANY_POST]: {
    statusCode: 429,
    message: "게시물을 너무 많이 작성했습니다.",
  },
  [BusinessErrorType.CONTENT_TOO_LONG]: {
    statusCode: 400,
    message: "내용이 너무 깁니다.",
  },
  [BusinessErrorType.PARSE_BODY_ERROR]: {
    statusCode: 400,
    message: "요청 본문을 파싱할 수 없습니다.",
  },
  [BusinessErrorType.ARTICLE_NOT_FOUND]: {
    statusCode: 404,
    message: "게시물을 찾을 수 없습니다.",
  },
  [BusinessErrorType.INVALID_EVENT_DATE]: {
    statusCode: 400,
    message: "이벤트 날짜가 유효하지 않습니다.",
  },
  [BusinessErrorType.UNKNOWN_SERVER_ERROR]: {
    statusCode: 500,
    message: "알 수 없는 서버 에러입니다.",
  },
};

// 기술적 에러 매핑
const TechnicalErrorTable: Record<
  TechnicalErrorType,
  { statusCode: number; message: string }
> = {
  // 데이터베이스 에러
  [TechnicalErrorType.OPTIMISTIC_LOCK_FAILED]: {
    statusCode: 409,
    message: "데이터 버전 충돌이 발생했습니다. (낙관적 락 실패)",
  },
  [TechnicalErrorType.UNIQUE_VIOLATION]: {
    statusCode: 409,
    message: "이미 존재하는 데이터입니다.",
  },
  [TechnicalErrorType.UNIQUE_VIOLATION_USERNAME]: {
    statusCode: 409,
    message: "이미 사용 중인 사용자명입니다.",
  },
  [TechnicalErrorType.UNIQUE_VIOLATION_EMAIL]: {
    statusCode: 409,
    message: "이미 사용 중인 이메일입니다.",
  },
  [TechnicalErrorType.UNIQUE_VIOLATION_CONTACT]: {
    statusCode: 409,
    message: "이미 사용 중인 연락처입니다.",
  },
  [TechnicalErrorType.UNIQUE_VIOLATION_NICKNAME]: {
    statusCode: 409,
    message: "이미 사용 중인 닉네임입니다.",
  },
  [TechnicalErrorType.DATABASE_ERROR]: {
    statusCode: 500,
    message: "데이터베이스 오류가 발생했습니다.",
  },
  [TechnicalErrorType.DATA_NOT_FOUND]: {
    statusCode: 404,
    message: "데이터를 찾을 수 없습니다.",
  },

  // 외부 서비스 에러
  [TechnicalErrorType.EXTERNAL_API_ERROR]: {
    statusCode: 502,
    message: "외부 서비스 오류가 발생했습니다.",
  },
  [TechnicalErrorType.EXTERNAL_API_BAD_REQUEST]: {
    statusCode: 400,
    message: "외부 API 요청이 잘못되었습니다.",
  },
  [TechnicalErrorType.EXTERNAL_API_TIMEOUT]: {
    statusCode: 504,
    message: "외부 서비스 응답이 시간 초과했습니다.",
  },
};

// ==================== Error Classes ====================

/**
 * 비즈니스 로직 에러
 * 도메인 특화 에러를 표현
 */
export class BusinessError extends Error {
  public readonly statusCode: number;
  public readonly type: BusinessErrorType;
  public readonly originalError?: Error;

  constructor(options: {
    type: BusinessErrorType;
    message?: string;
    originalError?: Error;
  }) {
    const defaultMessage = ErrorTable[options.type].message;
    const message = options.message ?? defaultMessage;

    super(message);

    this.name = "BusinessError";
    this.statusCode = ErrorTable[options.type].statusCode;
    this.type = options.type;
    this.originalError = options.originalError;
  }
}

/**
 * 검증 에러
 * 입력 데이터 검증 실패 시 사용
 */
export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly details: Record<string, string[]>;

  constructor(details: Record<string, string[]>) {
    super("입력 데이터 검증에 실패했습니다.");
    this.name = "ValidationError";
    this.details = details;
  }
}

/**
 * 인증 에러
 * 인증 실패, 토큰 만료 등
 */
export class AuthenticationError extends BusinessError {
  constructor(message?: string) {
    super({
      type: BusinessErrorType.UNAUTHORIZED_REQUEST,
      message,
    });
    this.name = "AuthenticationError";
  }
}

/**
 * 권한 에러
 * 접근 권한이 없을 때
 */
export class AuthorizationError extends BusinessError {
  constructor(message?: string) {
    super({
      type: BusinessErrorType.FORBIDDEN,
      message,
    });
    this.name = "AuthorizationError";
  }
}

/**
 * 찾을 수 없음 에러
 * 리소스가 존재하지 않을 때
 */
export class NotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly resourceName: string;

  constructor(resourceName: string, id?: string | number) {
    const message = id
      ? `${resourceName}(ID: ${id})을 찾을 수 없습니다.`
      : `${resourceName}을 찾을 수 없습니다.`;

    super(message);
    this.name = "NotFoundError";
    this.resourceName = resourceName;
  }
}

/**
 * 중복 에러
 * 이미 존재하는 리소스를 생성할 때
 */
export class ConflictError extends Error {
  public readonly statusCode = 409;
  public readonly resourceName: string;

  constructor(resourceName: string, field?: string) {
    const message = field
      ? `${resourceName}의 ${field}이 이미 존재합니다.`
      : `${resourceName}이 이미 존재합니다.`;

    super(message);
    this.name = "ConflictError";
    this.resourceName = resourceName;
  }
}

// ==================== Technical Errors ====================

/**
 * 기술적 에러
 * DB 제약 조건, 외부 API 오류 등
 */
export class TechnicalError extends Error {
  public readonly statusCode: number;
  public readonly type: TechnicalErrorType;
  public readonly originalError?: Error;
  public readonly context?: Record<string, any>;

  constructor(options: {
    type: TechnicalErrorType;
    message?: string;
    originalError?: Error;
    context?: Record<string, any>;
  }) {
    const defaultMessage = TechnicalErrorTable[options.type].message;
    const message = options.message ?? defaultMessage;

    super(message);

    this.name = "TechnicalError";
    this.statusCode = TechnicalErrorTable[options.type].statusCode;
    this.type = options.type;
    this.originalError = options.originalError;
    this.context = options.context;
  }
}

/**
 * 데이터베이스 에러
 * DB 작업 실패
 */
export class DatabaseError extends TechnicalError {
  constructor(message?: string, originalError?: Error) {
    super({
      type: TechnicalErrorType.DATABASE_ERROR,
      message: message || "데이터베이스 작업에 실패했습니다.",
      originalError,
    });
    this.name = "DatabaseError";
  }
}

/**
 * 낙관적 락 실패 에러
 * 동시성 제어 실패
 */
export class OptimisticLockError extends TechnicalError {
  public readonly resourceId: string;

  constructor(resourceId: string, originalError?: Error) {
    super({
      type: TechnicalErrorType.OPTIMISTIC_LOCK_FAILED,
      message: `데이터(ID: ${resourceId})의 버전이 충돌했습니다.`,
      originalError,
      context: { resourceId },
    });
    this.name = "OptimisticLockError";
    this.resourceId = resourceId;
  }
}

/**
 * 유니크 제약 조건 위반 에러
 */
export class UniqueViolationError extends TechnicalError {
  public readonly field: string;
  public readonly value: string;

  constructor(options: {
    field: string;
    value: string;
    originalError?: Error;
  }) {
    const typeMap: Record<string, TechnicalErrorType> = {
      username: TechnicalErrorType.UNIQUE_VIOLATION_USERNAME,
      email: TechnicalErrorType.UNIQUE_VIOLATION_EMAIL,
      contact: TechnicalErrorType.UNIQUE_VIOLATION_CONTACT,
      nickname: TechnicalErrorType.UNIQUE_VIOLATION_NICKNAME,
    };

    const type = typeMap[options.field] || TechnicalErrorType.UNIQUE_VIOLATION;

    super({
      type,
      message: `${options.field}(${options.value})은 이미 사용 중입니다.`,
      originalError: options.originalError,
      context: { field: options.field, value: options.value },
    });

    this.name = "UniqueViolationError";
    this.field = options.field;
    this.value = options.value;
  }
}

/**
 * 외부 API 에러
 */
export class ExternalApiError extends TechnicalError {
  public readonly apiName: string;
  public readonly statusCode: number;

  constructor(options: {
    apiName: string;
    statusCode?: number;
    message?: string;
    originalError?: Error;
  }) {
    let type = TechnicalErrorType.EXTERNAL_API_ERROR;

    if (options.statusCode === 400) {
      type = TechnicalErrorType.EXTERNAL_API_BAD_REQUEST;
    } else if (options.statusCode === 408 || options.statusCode === 504) {
      type = TechnicalErrorType.EXTERNAL_API_TIMEOUT;
    }

    super({
      type,
      message:
        options.message ||
        `외부 API(${options.apiName}) 호출 실패 (상태: ${options.statusCode || "Unknown"})`,
      originalError: options.originalError,
      context: { apiName: options.apiName, statusCode: options.statusCode },
    });

    this.name = "ExternalApiError";
    this.apiName = options.apiName;
    this.statusCode = options.statusCode || 500;
  }
}

// ==================== Error Response ====================

/**
 * API 에러 응답 형식
 */
export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    statusCode: number;
    details?: Record<string, string[]>;
  };
}

/**
 * 에러를 응답 형식으로 변환
 */
export function createErrorResponse(error: Error): ErrorResponse {
  if (error instanceof BusinessError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  if (error instanceof TechnicalError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: {
        type: "NOT_FOUND",
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  if (error instanceof ConflictError) {
    return {
      success: false,
      error: {
        type: "CONFLICT",
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  // 예상치 못한 에러
  return {
    success: false,
    error: {
      type: "INTERNAL_SERVER_ERROR",
      message: "알 수 없는 서버 에러입니다.",
      statusCode: 500,
    },
  };
}
////