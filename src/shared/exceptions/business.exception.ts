export enum BusinessExceptionType {
  TOKEN_EXPIRED,
  UNKOWN_SERVER_ERROR,
  EMAIL_REQUIRE,
  INVALIDE_EMAIL,
  PASSWORD_REQUIRED,
  EMAIL_DUPLICATE,
  NICKNAME_TOO_LONG,
  PASSWORD_TOO_SHORT,
  INVALID_AUTH,
  UNAUTORIZED_REQUEST,
  TOO_MANY_POST,
  CONTENT_TOO_LONG,
  PARSE_BODY_ERROR,
  USER_NOT_FOUND,
  ARTICLE_NOT_FOUND,
  NICKNAME_DUPLICATE,
  INVALID_PASSWORD,
  ALREADY_LIKED,
}

const BusinessExceptionTable: Record<
  BusinessExceptionType,
  { statusCode: number; message: string }
> = {
  [BusinessExceptionType.ALREADY_LIKED]: {
    statusCode: 400,
    message: "이미 좋아요를 눌렀어요.",
  },
  [BusinessExceptionType.INVALID_PASSWORD]: {
    statusCode: 401,
    message: "비밀 번호가 일치하지 않습니다",
  },
  [BusinessExceptionType.NICKNAME_DUPLICATE]: {
    statusCode: 401,
    message: "토큰이 만료되었습니다",
  },
  [BusinessExceptionType.TOKEN_EXPIRED]: {
    statusCode: 401,
    message: "토큰이 만료되었습니다",
  },
  [BusinessExceptionType.UNKOWN_SERVER_ERROR]: {
    statusCode: 500,
    message: "알 수 없는 서버 에러입니다.",
  },
  [BusinessExceptionType.EMAIL_REQUIRE]: {
    statusCode: 400,
    message: "이메일을 입력해주세요.",
  },
  [BusinessExceptionType.INVALIDE_EMAIL]: {
    statusCode: 400,
    message: "이메일 형식이 올바르지 않습니다.",
  },
  [BusinessExceptionType.PASSWORD_REQUIRED]: {
    statusCode: 400,
    message: "비밀번호를 입력해주세요.",
  },
  [BusinessExceptionType.EMAIL_DUPLICATE]: {
    statusCode: 409,
    message: "이미 존재하는 이메일이에요.",
  },
  [BusinessExceptionType.NICKNAME_TOO_LONG]: {
    statusCode: 400,
    message: "닉네임은 최대 20자까지 가능해요.",
  },
  [BusinessExceptionType.PASSWORD_TOO_SHORT]: {
    statusCode: 400,
    message: "비밀번호는 최소 8자 이상이어야 해요.",
  },
  [BusinessExceptionType.INVALID_AUTH]: {
    statusCode: 400,
    message: "이메일 또는 비밀번호가 일치하지 않아요.",
  },
  [BusinessExceptionType.UNAUTORIZED_REQUEST]: {
    statusCode: 400,
    message: "권한이 없어요.",
  },
  [BusinessExceptionType.TOO_MANY_POST]: {
    statusCode: 400,
    message: "",
  },
  [BusinessExceptionType.CONTENT_TOO_LONG]: {
    statusCode: 400,
    message: "",
  },
  [BusinessExceptionType.PARSE_BODY_ERROR]: {
    statusCode: 400,
    message: "",
  },
  [BusinessExceptionType.USER_NOT_FOUND]: {
    statusCode: 404,
    message: "",
  },
  [BusinessExceptionType.ARTICLE_NOT_FOUND]: {
    statusCode: 404,
    message: "",
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
