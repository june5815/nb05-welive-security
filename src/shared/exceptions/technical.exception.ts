export enum TechnicalExceptionType {
  UNKNOWN_SERVER_ERROR,
  OPTIMISTIC_LOCK_FAILED,
  UNIQUE_VIOLATION,
  UNIQUE_VIOLATION_EMAIL,
  UNIQUE_VIOLATION_NICKNAME,
  EXTERNAL_API_BAD_REQUEST,
  DATA_NOT_FOUND,
}

const TechnicalExceptionTable: Record<TechnicalExceptionType, string> = {
  [TechnicalExceptionType.DATA_NOT_FOUND]: "데이터를 찾을 수 없습니다.",
  [TechnicalExceptionType.UNKNOWN_SERVER_ERROR]:
    "알 수 없는 서버 에러가 발생했습니다.",
  [TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED]:
    "데이터 버전 충돌이 발생했습니다.(낙관적 락 실패)",
  [TechnicalExceptionType.UNIQUE_VIOLATION]:
    "데이터베이스 유니크 제약 조건 위반 에러가 발생했습니다.",
  [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL]:
    "이메일 유니크 제약 조건 위반 에러가 발생했습니다.",
  [TechnicalExceptionType.UNIQUE_VIOLATION_NICKNAME]:
    "닉네임 유니크 제약 조건 위반 에러가 발생했습니다.",
  [TechnicalExceptionType.EXTERNAL_API_BAD_REQUEST]:
    "외부 API 요청이 잘못되었습니다.",
};

export class TechnicalException extends Error {
  public readonly type: TechnicalExceptionType;
  public readonly error?: Error;
  public readonly meta?: unknown;

  constructor(options: {
    message?: string;
    type: TechnicalExceptionType;
    error: Error;
  }) {
    super(options.message ?? TechnicalExceptionTable[options.type]);
    this.type = options.type;
    this.error = options.error;
  }
}
