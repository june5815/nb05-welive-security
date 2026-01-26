import {
  TUserRole,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
  ITokenUtil,
  TokenUtil,
} from "../../../_common/utils/token.util";
import { IConfigUtil } from "../../../_common/utils/config.util";
import jwt from "jsonwebtoken";
import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";

describe("TokenUtil Unit Test", () => {
  let tokenUtil: ITokenUtil;

  const mockConfig = {
    parsed: jest.fn().mockReturnValue({
      ACCESS_TOKEN_SECRET: "test-access-secret-key",
      REFRESH_TOKEN_SECRET: "test-refresh-secret-key",
      ACCESS_TOKEN_EXPIRES_IN: "1h",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    }),
  } as IConfigUtil;

  beforeAll(() => {
    tokenUtil = TokenUtil(mockConfig);
  });
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("generateAccessToken 함수 테스트", () => {
    test("Access Token을 정상적으로 생성해야 한다.", () => {
      const payload = { userId: "user-1", role: "USER" as TUserRole };

      const token = tokenUtil.generateAccessToken(payload);

      const decoded = jwt.verify(
        token,
        mockConfig.parsed().ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe("generateRefreshToken 함수 테스트", () => {
    test("Refresh Token을 정상적으로 생성해야 한다.", () => {
      const payload = { userId: "user-1" };

      const token = tokenUtil.generateRefreshToken(payload);

      const decoded = jwt.verify(
        token,
        mockConfig.parsed().REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;
      expect(decoded.userId).toBe(payload.userId);
    });
  });

  describe("generateCsrfValue 함수 테스트", () => {
    test("16바이트(32자) 길이의 Hex 문자열을 반환해야 한다.", () => {
      const csrf = tokenUtil.generateCsrfValue();

      expect(typeof csrf).toBe("string");
      expect(csrf).toHaveLength(32);
    });
  });

  describe("verifyToken 함수 테스트", () => {
    test("유효한 Access Token을 검증하면 Payload를 반환해야 한다.", () => {
      const token = jwt.sign(
        { userId: "user-1", role: "USER" as TUserRole },
        mockConfig.parsed().ACCESS_TOKEN_SECRET,
      );

      const result = tokenUtil.verifyToken({
        token,
        type: "ACCESS" as TokenType,
      }) as AccessTokenPayload;

      expect(result.userId).toBe("user-1");
      expect(result.role).toBe("USER");
    });

    test("유효한 Refresh Token을 검증하면 Payload를 반환해야 한다.", () => {
      const token = jwt.sign(
        { userId: "user-1" },
        mockConfig.parsed().REFRESH_TOKEN_SECRET,
      );

      const result = tokenUtil.verifyToken({
        token,
        type: "REFRESH" as TokenType,
      }) as RefreshTokenPayload;

      expect(result.userId).toBe("user-1");
    });

    test("만료된 토큰인 경우 TOKEN_EXPIRED 에러를 던져야 한다.", () => {
      const token = jwt.sign(
        { userId: "user-1" },
        mockConfig.parsed().ACCESS_TOKEN_SECRET,
        { expiresIn: "0s" },
      );

      const action = () =>
        tokenUtil.verifyToken({ token, type: "ACCESS" as TokenType });
      expect(action).toThrow(
        expect.objectContaining({
          type: BusinessExceptionType.TOKEN_EXPIRED,
        }),
      );
    });

    test("ignoreExpiration: true 옵션을 주면 만료된 토큰도 통과해야 한다.", () => {
      const token = jwt.sign(
        { userId: "user-1", role: "USER" as TUserRole },
        mockConfig.parsed().ACCESS_TOKEN_SECRET,
        { expiresIn: "0s" },
      );

      const result = tokenUtil.verifyToken({
        token,
        type: "ACCESS" as TokenType,
        ignoreExpiration: true,
      }) as AccessTokenPayload;

      expect(result.userId).toBe("user-1");
    });

    test("비밀키가 틀린 토큰인 경우 INVALID_TOKEN 에러를 던져야 한다.", () => {
      const token = jwt.sign({ userId: "user-1" }, "WRONG-KEY");

      const action = () =>
        tokenUtil.verifyToken({ token, type: "ACCESS" as TokenType });
      expect(action).toThrow(
        expect.objectContaining({
          type: BusinessExceptionType.INVALID_TOKEN,
        }),
      );
    });

    test("토큰 형식이 잘못된 경우 INVALID_TOKEN 에러를 던져야 한다.", () => {
      const token = "invalid-token";

      const action = () =>
        tokenUtil.verifyToken({ token, type: "ACCESS" as TokenType });
      expect(action).toThrow(
        expect.objectContaining({
          type: BusinessExceptionType.INVALID_TOKEN,
        }),
      );
    });
  });
});
