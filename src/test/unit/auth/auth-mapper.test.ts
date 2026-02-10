import { AuthMapper } from "../../../_infra/mappers/auth.mapper";
import { RefreshToken } from "../../../_modules/auth/domain/auth.entity";

describe("AuthMapper Unit Test", () => {
  beforeAll(() => {});
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("toCreate 함수 확인", () => {
    test("entity를 DB 저장용 데이터로 변환해야 한다.", () => {
      const domainEntity: RefreshToken = {
        refreshToken: "hashed_refresh_token",
        userId: "user-1",
      };

      const result = AuthMapper.toCreate(domainEntity);

      expect(result.refreshToken).toBe("hashed_refresh_token");
      expect(result.userId).toBe("user-1");
      expect(result.updatedAt).toBeUndefined();
    });
  });

  describe("toEntity 함수 확인", () => {
    test("DB 데이터를 entity로 변환해야 한다.", () => {
      const prismaResult = {
        id: "uuid-1234",
        userId: "user-1",
        refreshToken: "hashed_refresh_token",
        updatedAt: new Date("2026-01-26"),
      };

      const result = AuthMapper.toEntity(prismaResult);

      expect(result.refreshToken).toBe("hashed_refresh_token");
      expect(result.userId).toBe("user-1");
      expect(result.updatedAt).toEqual(new Date("2026-01-26"));
    });
  });
});
