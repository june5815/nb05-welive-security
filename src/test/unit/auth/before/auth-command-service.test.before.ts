import {
  IAuthCommandService,
  AuthCommandService,
} from "../../../../_modules/auth/service/auth-command.service";
import {
  AuthEntity,
  RefreshToken,
} from "../../../../_modules/auth/domain/auth.entity";
import { IUnitOfWork } from "../../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../../_common/utils/token.util";
import { IAuthCommandRepo } from "../../../../_common/ports/repos/auth/auth-command-repo.interface";
import { IRedisExternal } from "../../../../_common/ports/externals/redis-external.interface";
import { IUserCommandRepo } from "../../../../_common/ports/repos/user/user-command-repo.interface";
import { BusinessExceptionType } from "../../../../_common/exceptions/business.exception";
import {
  UserRole,
  JoinStatus,
} from "../../../../_modules/users/domain/user.entity";

describe("AuthCommandService Unit Test", () => {
  let authService: IAuthCommandService;

  const mockUnitOfWork = {
    doTx: jest.fn().mockImplementation(async (callback) => callback()),
  } as IUnitOfWork;

  const mockHashManager = {
    hash: jest.fn(),
    compare: jest.fn(),
  } as IHashManager;

  const mockTokenUtil = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    generateCsrfValue: jest.fn(),
    verifyToken: jest.fn(),
  } as jest.Mocked<ITokenUtil>;

  const mockAuthCommandRepo = {
    upsertRefreshToken: jest.fn(),
    findByUserId: jest.fn(),
    deleteRefreshToken: jest.fn(),
  } as jest.Mocked<IAuthCommandRepo>;

  const mockRedisExternal = {
    get: jest.fn(),
    getMany: jest.fn(),
    set: jest.fn(),
    setIfNotExist: jest.fn(),
    del: jest.fn(),
    delIfMatched: jest.fn(),
    getMembersFromSet: jest.fn(),
    addToSet: jest.fn(),
    removeMemberFromSet: jest.fn(),
    popFromSet: jest.fn(),
    increase: jest.fn(),
    decrease: jest.fn(),
  } as jest.Mocked<IRedisExternal>;

  const mockUserCommandRepo = {
    createSuperAdmin: jest.fn(),
    createAdmin: jest.fn(),
    createResidentUser: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findApartmentByAdminOf: jest.fn(),
    lockManyAdmin: jest.fn(),
    lockManyResidentUser: jest.fn(),
    update: jest.fn(),
    approveManyAdmin: jest.fn(),
    rejectManyAdmin: jest.fn(),
    approveManyResidentUser: jest.fn(),
    rejectManyResidentUser: jest.fn(),
    deleteAdmin: jest.fn(),
    deleteManyAdmin: jest.fn(),
    deleteManyResidentUser: jest.fn(),
  } as jest.Mocked<IUserCommandRepo>;

  beforeAll(() => {
    authService = AuthCommandService(
      mockUnitOfWork,
      mockHashManager,
      mockTokenUtil,
      // mockAuthCommandRepo,
      mockRedisExternal,
      mockUserCommandRepo,
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("login 함수 확인", () => {
    const loginReqDto = {
      body: { username: "user", password: "password" },
    };

    const mockUser = {
      id: "user-1",
      username: "user",
      email: "test@test.com",
      contact: "01012345678",
      name: "Test",
      password: "hashed_password",
      role: UserRole.USER,
      avatar: undefined,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
      resident: {
        id: "resident-1",
        isHouseholder: true,
        household: {
          apartmentId: "apartment-1",
          building: 1,
          unit: 101,
        },
      },
    };

    const loginResDto = {
      id: "user-1",
      username: "user",
      email: "test@test.com",
      contact: "01012345678",
      name: "Test",
      role: UserRole.USER,
      avatar: undefined,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
      resident: {
        id: "resident-1",
        apartmentId: "apartment-1",
        building: 1,
        unit: 101,
        isHouseholder: true,
      },
    };

    test("성공: 유저가 존재하고 비밀번호가 맞으면 토큰과 유저 정보를 반환해야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(AuthEntity, "isPasswordMatched").mockResolvedValue(true);
      jest.spyOn(AuthEntity, "toCreate").mockResolvedValue({
        userId: "user-1",
        refreshToken: "hashed_refresh_token",
      } as RefreshToken);

      mockTokenUtil.generateRefreshToken.mockReturnValue("new_refresh_token");
      mockTokenUtil.generateAccessToken.mockReturnValue("new_access_token");
      mockTokenUtil.generateCsrfValue.mockReturnValue("csrf_value");

      const result = await authService.login(loginReqDto);

      expect(mockUnitOfWork.doTx).toHaveBeenCalled();
      expect(mockAuthCommandRepo.upsertRefreshToken).toHaveBeenCalled();
      expect(result.tokenResDto.accessToken).toBe("new_access_token");
      expect(result.tokenResDto.refreshToken).toBe("new_refresh_token");
      expect(result.tokenResDto.csrfValue).toBe("csrf_value");
      expect(result.loginResDto).toEqual({ ...loginResDto });
    });

    test("실패: 유저가 없거나 비밀번호가 틀리면 INVALID_AUTH 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(AuthEntity, "isPasswordMatched").mockResolvedValue(false);

      await expect(authService.login(loginReqDto)).rejects.toMatchObject({
        type: BusinessExceptionType.INVALID_AUTH,
      });
    });

    test("실패: 승인 대기중(PENDING)인 유저는 STATUS_IS_PENDING 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue({
        ...mockUser,
        joinStatus: JoinStatus.PENDING,
        isActive: false,
      });
      jest.spyOn(AuthEntity, "isPasswordMatched").mockResolvedValue(true);

      await expect(authService.login(loginReqDto)).rejects.toMatchObject({
        type: BusinessExceptionType.STATUS_IS_PENDING,
      });
    });

    test("실패: 승인 거부된(REJECTED)인 유저는 REJECTED_USER 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue({
        ...mockUser,
        joinStatus: JoinStatus.REJECTED,
        isActive: false,
      });
      jest.spyOn(AuthEntity, "isPasswordMatched").mockResolvedValue(true);

      await expect(authService.login(loginReqDto)).rejects.toMatchObject({
        type: BusinessExceptionType.REJECTED_USER,
      });
    });
  });

  describe("logout 함수 확인", () => {
    const refreshToken = "refresh_token";

    test("토큰 검증 후 DB에서 리프레시 토큰을 삭제해야 한다.", async () => {
      mockTokenUtil.verifyToken.mockReturnValue({ userId: "user-1" } as any);
      mockAuthCommandRepo.findByUserId.mockResolvedValue({
        userId: "user-1",
        refreshToken: "hashed_refresh_token",
      });
      jest.spyOn(AuthEntity, "isRefreshTokenMatched").mockResolvedValue(true);

      await authService.logout(refreshToken);

      expect(mockTokenUtil.verifyToken).toHaveBeenCalledWith(
        expect.objectContaining({
          token: refreshToken,
          type: "REFRESH",
          ignoreExpiration: true,
        }),
      );
      expect(mockAuthCommandRepo.deleteRefreshToken).toHaveBeenCalledWith(
        "user-1",
      );
    });
  });

  describe("refreshToken 함수 확인", () => {
    const dto = { cookie: { refreshToken: "old_token" } };
    const mockUser = {
      id: "user-1",
      role: UserRole.USER,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
    } as any;

    test("성공: 기존 리프레시 토큰이 유효하면 새로운 토큰 세트를 발급해야 한다.", async () => {
      mockTokenUtil.verifyToken.mockReturnValue({ userId: "user-1" } as any);
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);
      mockAuthCommandRepo.findByUserId.mockResolvedValue({
        userId: "user-1",
        refreshToken: "hashed_old_refresh_token",
      });

      jest.spyOn(AuthEntity, "isRefreshTokenMatched").mockResolvedValue(true);
      jest.spyOn(AuthEntity, "toCreate").mockResolvedValue({
        userId: "user-1",
        refreshToken: "hashed_new_refresh_token",
      } as RefreshToken);

      mockTokenUtil.generateAccessToken.mockReturnValue("new_access_token");
      mockTokenUtil.generateRefreshToken.mockReturnValue("new_refresh_token");
      mockTokenUtil.generateCsrfValue.mockReturnValue("new_csrf_value");

      const result = await authService.refreshToken(dto);

      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith(
        "user-1",
        "update",
      );
      expect(mockAuthCommandRepo.upsertRefreshToken).toHaveBeenCalled();
      expect(result.newAccessToken).toBe("new_access_token");
      expect(result.newRefreshToken).toBe("new_refresh_token");
      expect(result.newCsrfValue).toBe("new_csrf_value");
    });

    test("실패: 유저를 찾을 수 없으면 INVALID_AUTH 에러를 던져야 한다.", async () => {
      mockTokenUtil.verifyToken.mockReturnValue({ userId: "user-1" } as any);
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(authService.refreshToken(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.INVALID_AUTH,
      });
    });

    test("실패: 승인 대기중(PENDING)인 유저는 STATUS_IS_PENDING 에러를 던져야 한다.", async () => {
      mockTokenUtil.verifyToken.mockReturnValue({ userId: "user-1" } as any);
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockUser,
        joinStatus: JoinStatus.PENDING,
        isActive: false,
      });

      await expect(authService.refreshToken(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.STATUS_IS_PENDING,
      });
    });

    test("실패: 승인 거부된(REJECTED)인 유저는 REJECTED_USER 에러를 던져야 한다.", async () => {
      mockTokenUtil.verifyToken.mockReturnValue({ userId: "user-1" } as any);
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockUser,
        joinStatus: JoinStatus.REJECTED,
        isActive: false,
      });

      await expect(authService.refreshToken(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.REJECTED_USER,
      });
    });
  });
});
