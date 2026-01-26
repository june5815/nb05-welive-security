import {
  AuthEntity,
  RefreshToken,
} from "../../../_modules/auth/domain/auth.entity";
import { User } from "../../../_modules/users/domain/user.entity";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";

describe("AuthEntity Unit Test", () => {
  const mockHashManager = {
    hash: jest.fn(),
    compare: jest.fn(),
  } as IHashManager;

  beforeAll(() => {});
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("toCreate 함수 확인", () => {
    test("토큰을 해싱하여 RefreshToken 객체를 생성해야 한다.", async () => {
      const userId = "user-1";
      const plainToken = "refresh-token";
      (mockHashManager.hash as jest.Mock).mockResolvedValue("hashed_token");

      const result = await AuthEntity.toCreate(
        userId,
        plainToken,
        mockHashManager,
      );

      expect(mockHashManager.hash).toHaveBeenCalledWith(plainToken);
      expect(result.userId).toBe(userId);
      expect(result.refreshToken).toBe("hashed_token");
    });
  });

  describe("isPasswordMatched 함수 확인", () => {
    test("비밀번호가 일치하면 true를 반환해야 한다.", async () => {
      const user = { password: "hashed_password" } as User;
      (mockHashManager.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthEntity.isPasswordMatched(
        user,
        "password",
        mockHashManager,
      );

      expect(mockHashManager.compare).toHaveBeenCalledWith({
        plainString: "password",
        hashedString: "hashed_password",
      });
      expect(result).toBe(true);
    });

    test("비밀번호가 없으면 false를 반환해야 한다.", async () => {
      const user = { password: "" } as User;

      const result = await AuthEntity.isPasswordMatched(
        user,
        "password",
        mockHashManager,
      );

      expect(result).toBe(false);
      expect(mockHashManager.compare).not.toHaveBeenCalled();
    });
  });

  describe("isRefreshTokenMatched 함수 확인", () => {
    const tokenData: RefreshToken = {
      refreshToken: "hashed_refresh_token",
      userId: "user-1",
    };

    test("토큰이 일치하면 true를 반환해야 한다.", async () => {
      (mockHashManager.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthEntity.isRefreshTokenMatched(
        tokenData,
        "refresh_token",
        mockHashManager,
      );

      expect(mockHashManager.compare).toHaveBeenCalledWith({
        plainString: "refresh_token",
        hashedString: "hashed_refresh_token",
      });
      expect(result).toBe(true);
    });

    test("토큰 데이터가 없으면 UNAUTHORIZED_REQUEST 에러를 던져야 한다.", async () => {
      await expect(
        AuthEntity.isRefreshTokenMatched(
          null,
          "refresh_token",
          mockHashManager,
        ),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    });

    test("토큰 데이터의 내부에 토큰이 없다면 UNAUTHORIZED_REQUEST 에러를 던져야 한다.", async () => {
      const emptyTokenData = {
        refreshToken: "",
        userId: "user-1",
      } as RefreshToken;

      await expect(
        AuthEntity.isRefreshTokenMatched(
          emptyTokenData,
          "refresh_token",
          mockHashManager,
        ),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    });
  });
});
