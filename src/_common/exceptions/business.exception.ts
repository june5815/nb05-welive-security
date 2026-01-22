export enum BusinessExceptionType {
  FORBIDDEN,
  UNAUTHORIZED_REQUEST,
  UNKOWN_SERVER_ERROR,

  USER_NOT_FOUND,
  ARTICLE_NOT_FOUND,

  NOTICE_CONTENT_REQUIRED,
  NOTICE_TITLE_REQUIRED,
  INVALID_EVENT_DATE,
  NOTICE_NOT_FOUND,

  COMMENT_CONTENT_REQUIRED,
  COMMENT_NOT_FOUND,

  COMPLAINT_TITLE_REQUIRED,
  COMPLAINT_CONTENT_REQUIRED,

  DUPLICATE_EMAIL,
  DUPLICATE_USERNAME,
  DUPLICATE_CONTACT,
  DUPLICATE_APARTMENT,
  INVALID_PASSWORD,
  INVALID_AUTH,
  INVALID_INPUT_IMAGE,
  IMAGE_NOT_FOUND,
  STATUS_IS_PENDING,
  REJECTED_USER,

  INVALID_TOKEN,
  TOKEN_EXPIRED,

  NOT_FOUND,

  VALIDATION_ERROR,
}

const BusinessExceptionTable: Record<
  BusinessExceptionType,
  { statusCode: number; message: string }
> = {
  [BusinessExceptionType.FORBIDDEN]: {
    statusCode: 401,
    message: "권한과 관련된 오류입니다.",
  },
  [BusinessExceptionType.UNAUTHORIZED_REQUEST]: {
    statusCode: 401,
    message: "권한이 없어요.",
  },
  [BusinessExceptionType.UNKOWN_SERVER_ERROR]: {
    statusCode: 500,
    message: "알 수 없는 서버 에러입니다.",
  },
  [BusinessExceptionType.USER_NOT_FOUND]: {
    statusCode: 404,
    message: "해당되는 유저를 찾을 수 없습니다. 다시 확인해 주세요.",
  },
  [BusinessExceptionType.ARTICLE_NOT_FOUND]: {
    statusCode: 404,
    message: "",
  },
  [BusinessExceptionType.NOTICE_CONTENT_REQUIRED]: {
    statusCode: 400,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },
  [BusinessExceptionType.NOTICE_TITLE_REQUIRED]: {
    statusCode: 400,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },
  [BusinessExceptionType.INVALID_EVENT_DATE]: {
    statusCode: 401,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },
  [BusinessExceptionType.NOTICE_NOT_FOUND]: {
    statusCode: 401,
    message: "공지사항을 찾을 수 없습니다.",
  },
  [BusinessExceptionType.COMMENT_CONTENT_REQUIRED]: {
    statusCode: 401,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },
  [BusinessExceptionType.COMMENT_NOT_FOUND]: {
    statusCode: 401,
    message: "댓글을 찾을 수 없습니다.",
  },
  [BusinessExceptionType.COMPLAINT_TITLE_REQUIRED]: {
    statusCode: 400,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },
  [BusinessExceptionType.COMPLAINT_CONTENT_REQUIRED]: {
    statusCode: 400,
    message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.",
  },

  // User
  [BusinessExceptionType.DUPLICATE_EMAIL]: {
    statusCode: 400,
    message: "이메일이 중복되었습니다.",
  },
  [BusinessExceptionType.DUPLICATE_USERNAME]: {
    statusCode: 400,
    message: "아이디가 중복되었습니다.",
  },
  [BusinessExceptionType.DUPLICATE_CONTACT]: {
    statusCode: 400,
    message: "연락처가 중복되었습니다.",
  },
  [BusinessExceptionType.DUPLICATE_APARTMENT]: {
    statusCode: 400,
    message: "이미 관리자가 존재하는 아파트입니다.",
  },
  [BusinessExceptionType.INVALID_PASSWORD]: {
    statusCode: 400,
    message: "비밀번호가 일치하지 않습니다.",
  },
  [BusinessExceptionType.INVALID_AUTH]: {
    statusCode: 400,
    message: "이메일 또는 비밀번호가 일치하지 않아요.",
  },
  [BusinessExceptionType.INVALID_INPUT_IMAGE]: {
    statusCode: 400,
    message: "이미지 파일만 업로드 가능합니다.",
  },
  [BusinessExceptionType.IMAGE_NOT_FOUND]: {
    statusCode: 400,
    message: "이미지 파일을 찾을 수 없습니다. 다시 업로드해주세요.",
  },
  [BusinessExceptionType.STATUS_IS_PENDING]: {
    statusCode: 401,
    message: "계정 승인 대기 중입니다. 승인 후 서비스 이용이 가능합니다.",
  },
  [BusinessExceptionType.REJECTED_USER]: {
    statusCode: 401,
    message: "비활성화된 계정입니다.",
  },

  // Token Error
  [BusinessExceptionType.INVALID_TOKEN]: {
    statusCode: 401,
    message: "유효하지 않은 토큰입니다.",
  },
  [BusinessExceptionType.TOKEN_EXPIRED]: {
    statusCode: 401,
    message: "토큰이 만료되었습니다.",
  },

  // Not Found
  [BusinessExceptionType.NOT_FOUND]: {
    statusCode: 404,
    message: "해당되는 요청을 찾을 수 없습니다.",
  },

  // Validation Error
  [BusinessExceptionType.VALIDATION_ERROR]: {
    statusCode: 400,
    message: "요청 데이터 형식이 올바르지 않습니다.",
  },
};

export class BusinessException extends Error {
  public readonly statusCode: number;
  public readonly type: BusinessExceptionType;
  public readonly error?: Error;

  constructor(options: {
    message?: string;
    type: BusinessExceptionType;
    error?: Error;
  }) {
    super(options.message ?? BusinessExceptionTable[options.type].message);
    this.statusCode = BusinessExceptionTable[options.type].statusCode;
    this.type = options.type;
    this.error = options.error;
  }
}
