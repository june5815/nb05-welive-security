import {
  IUserQueryService,
  UserQueryService,
} from "../../../_modules/users/service/user-query.service";
import { IUserQueryRepo } from "../../../_common/ports/repos/user/user-query-repo.interface";
import { UserRole } from "../../../_modules/users/domain/user.entity";
import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";
import {
  getAdminListReqDTO,
  getAdminReqDTO,
  getMyProfileReqDTO,
  getResidentUserListReqDTO,
} from "../../../_modules/users/dtos/req/user.request";
import {
  AdminListResView,
  AdminView,
  ProfileView,
  ResidentUserListResView,
} from "../../../_modules/users/dtos/res/user.view";

describe("UserQueryService Unit Test", () => {
  let service: IUserQueryService;

  const mockUserQueryRepo = {
    findAdminById: jest.fn(),
    getMyProfile: jest.fn(),
    findAdminList: jest.fn(),
    findResidentUserList: jest.fn(),
    findAllSuperAdmins: jest.fn(),
    findApartmentById: jest.fn(),
  } as jest.Mocked<IUserQueryRepo>;

  beforeAll(() => {
    service = UserQueryService(mockUserQueryRepo);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("findAdminById 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      params: { adminId: "admin-1" },
    } as getAdminReqDTO;

    const mockAdminView = {
      email: "admin@test.com",
      contact: "01012345678",
      name: "Admin",
      adminOf: {
        name: "APT",
        address: "address",
        description: "description",
        officeNumber: "021234567",
      },
    } as AdminView;

    test("성공: 슈퍼 관리자는 특정 관리자의 상세 정보를 조회할 수 있다.", async () => {
      mockUserQueryRepo.findAdminById.mockResolvedValue(mockAdminView);

      const result = await service.findAdminById(dto);

      expect(mockUserQueryRepo.findAdminById).toHaveBeenCalledWith(
        dto.params.adminId,
      );
      expect(result).toEqual(mockAdminView);
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.findAdminById(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN } as any;

      await expect(service.findAdminById(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 관리자 정보가 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserQueryRepo.findAdminById.mockResolvedValue(null);

      await expect(service.findAdminById(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });
  });

  describe("getMyProfile 함수 확인", () => {
    const residentUserDto = {
      userId: "user-1",
      role: UserRole.USER,
    } as getMyProfileReqDTO;
    const adminDto = {
      userId: "admin-1",
      role: UserRole.ADMIN,
    } as getMyProfileReqDTO;

    const mockProfile = {
      id: "user-1",
      username: "user",
      contact: "01012345678",
      name: "User",
      email: "user@test.com",
      avatar: undefined,
    } as ProfileView;

    test("성공: 입주민은 자신의 프로필을 조회할 수 있다.", async () => {
      mockUserQueryRepo.getMyProfile.mockResolvedValue(mockProfile);

      const result = await service.getMyProfile(residentUserDto);

      expect(mockUserQueryRepo.getMyProfile).toHaveBeenCalledWith(
        residentUserDto.userId,
      );
      expect(result).toEqual(mockProfile);
    });

    test("성공: 관리자는 자신의 프로필을 조회할 수 있다.", async () => {
      mockUserQueryRepo.getMyProfile.mockResolvedValue(mockProfile);

      const result = await service.getMyProfile(adminDto);

      expect(mockUserQueryRepo.getMyProfile).toHaveBeenCalledWith(
        adminDto.userId,
      );
      expect(result).toEqual(mockProfile);
    });

    test("실패: 슈퍼 관리자가 접근하면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = {
        ...residentUserDto,
        role: UserRole.SUPER_ADMIN,
      } as any;

      await expect(service.getMyProfile(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 프로필이 존재하지 않으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserQueryRepo.getMyProfile.mockResolvedValue(null);

      await expect(service.getMyProfile(adminDto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });
  });

  describe("getAdminList 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      query: { page: 1, limit: 11 },
    } as getAdminListReqDTO;

    const mockListRes = {
      data: [],
      totalCount: 0,
      page: 1,
      limit: 11,
      hasNext: false,
    } as AdminListResView;

    test("성공: 슈퍼 관리자는 관리자 목록을 조회할 수 있다.", async () => {
      mockUserQueryRepo.findAdminList.mockResolvedValue(mockListRes);

      const result = await service.getAdminList(dto);

      expect(mockUserQueryRepo.findAdminList).toHaveBeenCalledWith(dto.query);
      expect(result).toEqual(mockListRes);
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.getAdminList(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN } as any;

      await expect(service.getAdminList(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });

  describe("getResidentUserList 함수 확인", () => {
    const dto = {
      userId: "admin-1",
      role: UserRole.ADMIN,
      query: { page: 1, limit: 11 },
    } as getResidentUserListReqDTO;

    const mockListRes = {
      data: [],
      totalCount: 0,
      page: 1,
      limit: 11,
      hasNext: false,
    } as ResidentUserListResView;

    test("성공: 관리자는 입주민 목록을 조회할 수 있다.", async () => {
      mockUserQueryRepo.findResidentUserList.mockResolvedValue(mockListRes);

      const result = await service.getResidentUserList(dto);

      expect(mockUserQueryRepo.findResidentUserList).toHaveBeenCalledWith(
        dto.query,
        dto.userId,
      );
      expect(result).toEqual(mockListRes);
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.getResidentUserList(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN } as any;

      await expect(
        service.getResidentUserList(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });
});
