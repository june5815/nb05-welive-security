import {
  IUserCommandService,
  UserCommandService,
} from "../../../_modules/users/service/user-command.service";
import {
  AdminOf,
  User,
  UserEntity,
  UserRole,
} from "../../../_modules/users/domain/user.entity";
import { IUserCommandRepo } from "../../../_common/ports/repos/user/user-command-repo.interface";
import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";
import {
  createUserReqDTO,
  deleteAdminReqDTO,
  deleteRejectedUsersReqDTO,
  updateAdminDataReqDTO,
  updateAvatarReqDTO,
  updatePasswordReqDTO,
  updateUserListSignUpStatusReqDTO,
  updateUserSignUpStatusReqDTO,
} from "../../../_modules/users/dtos/req/user.request";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";

describe("UserCommandService Unit Test", () => {
  let service: IUserCommandService;

  const mockUnitOfWork = {
    doTx: jest.fn().mockImplementation(async (callback) => callback()),
  } as IUnitOfWork;

  const mockHashManager = {
    hash: jest.fn(),
    compare: jest.fn(),
  } as IHashManager;

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
    service = UserCommandService(
      mockUnitOfWork,
      mockHashManager,
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

  describe("signUp 함수들 확인", () => {
    const baseDto = {
      body: {
        username: "user",
        password: "password",
        email: "test@test.com",
        contact: "01012345678",
        name: "User",
      },
    } as createUserReqDTO;
    const adminDto = {
      body: {
        ...baseDto.body,
        adminOf: {
          name: "apt name",
          address: "apt address",
          description: "apt description",
          officeNumber: "apt officeNumber",
          buildingNumberFrom: 1,
          buildingNumberTo: 5,
          floorCountPerBuilding: 9,
          unitCountPerFloor: 4,
        },
      },
    } as createUserReqDTO;
    const residentUserDto = {
      body: {
        ...baseDto.body,
        resident: {
          apartmentId: "apartment-1",
          building: 1,
          unit: 201,
        },
      },
    } as createUserReqDTO;

    test("signUpSuperAdmin 성공: 중복된 유저가 없으면 슈퍼 관리자를 생성해야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user-1",
        role: UserRole.SUPER_ADMIN,
        joinStatus: "APPROVED",
        isActive: true,
      } as User;
      jest
        .spyOn(UserEntity, "createSuperAdmin")
        .mockResolvedValue(mockCreatedUser);
      mockUserCommandRepo.createSuperAdmin.mockResolvedValue(mockCreatedUser);

      const result = await service.signUpSuperAdmin(baseDto);

      expect(mockUserCommandRepo.createSuperAdmin).toHaveBeenCalledWith(
        mockCreatedUser,
      );
      expect(result).toEqual(mockCreatedUser);
    });

    test("signUpSuperAdmin 실패: 이미 존재하는 닉네임이라면 DUPLICATE_USERNAME 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue({
        id: "other-user",
        username: "user",
      } as User);

      await expect(service.signUpSuperAdmin(baseDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_USERNAME,
      });
    });

    test("signUpSuperAdmin 실패: 이미 존재하는 이메일이라면 DUPLICATE_EMAIL 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const duplicateEmailError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
        error: new Error("Duplicate email"),
      });

      mockUserCommandRepo.createSuperAdmin.mockRejectedValue(
        duplicateEmailError,
      );

      await expect(service.signUpSuperAdmin(baseDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_EMAIL,
      });
    });

    test("signUpSuperAdmin 실패: 이미 존재하는 닉네임이라면 DUPLICATE_CONTACT 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const duplicateContactError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        error: new Error("Duplicate contact"),
      });

      mockUserCommandRepo.createSuperAdmin.mockRejectedValue(
        duplicateContactError,
      );

      await expect(service.signUpSuperAdmin(baseDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_CONTACT,
      });
    });

    test("signUpAdmin 성공: 중복된 유저나 아파트가 없으면 관리자를 생성해야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);
      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user-1",
        role: UserRole.ADMIN,
        joinStatus: "PENDING",
        isActive: false,
      } as User;
      jest.spyOn(UserEntity, "createAdmin").mockResolvedValue(mockCreatedUser);
      mockUserCommandRepo.createAdmin.mockResolvedValue(mockCreatedUser);

      const result = await service.signUpAdmin(adminDto);

      expect(mockUnitOfWork.doTx).toHaveBeenCalled();
      expect(mockUserCommandRepo.findApartmentByAdminOf).toHaveBeenCalledWith(
        adminDto.body.adminOf as AdminOf,
        "update",
      );
      expect(mockUserCommandRepo.createAdmin).toHaveBeenCalledWith(
        mockCreatedUser,
      );
      expect(result).toEqual(mockCreatedUser);
    });

    test("signUpAdmin 실패: 이미 존재하는 닉네임이라면 DUPLICATE_USERNAME 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue({
        id: "other-user",
        username: "user",
      } as User);

      await expect(service.signUpAdmin(adminDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_USERNAME,
      });
    });

    test("signUpAdmin 실패: 이미 존재하는 아파트 관리자라면 DUPLICATE_APARTMENT 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);
      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue({
        admin: { id: "other-admin" },
      } as any);

      await expect(service.signUpAdmin(adminDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_APARTMENT,
      });
    });

    test("signUpAdmin 실패: 이미 존재하는 이메일이라면 DUPLICATE_EMAIL 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);
      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue(null);

      const duplicateEmailError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
        error: new Error("Duplicate email"),
      });

      mockUserCommandRepo.createAdmin.mockRejectedValue(duplicateEmailError);

      await expect(service.signUpAdmin(adminDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_EMAIL,
      });
    });

    test("signUpAdmin 실패: 이미 존재하는 닉네임이라면 DUPLICATE_CONTACT 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);
      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue(null);

      const duplicateContactError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        error: new Error("Duplicate contact"),
      });

      mockUserCommandRepo.createAdmin.mockRejectedValue(duplicateContactError);

      await expect(service.signUpAdmin(adminDto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_CONTACT,
      });
    });

    test("signUpResidentUser 성공: 중복된 유저가 없으면 입주민을 생성해야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user-1",
        role: UserRole.USER,
        joinStatus: "PENDING",
        isActive: false,
      } as User;
      jest
        .spyOn(UserEntity, "createResidentUser")
        .mockResolvedValue(mockCreatedUser);
      mockUserCommandRepo.createResidentUser.mockResolvedValue(mockCreatedUser);

      const result = await service.signUpResidentUser(residentUserDto);

      expect(mockUserCommandRepo.createResidentUser).toHaveBeenCalledWith(
        mockCreatedUser,
      );
      expect(result).toEqual(mockCreatedUser);
    });

    test("signUpResidentUser 실패: 이미 존재하는 닉네임이라면 DUPLICATE_USERNAME 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue({
        id: "other-user",
        username: "user",
      } as User);

      await expect(
        service.signUpResidentUser(residentUserDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_USERNAME,
      });
    });

    test("signUpResidentUser 실패: 이미 존재하는 이메일이라면 DUPLICATE_EMAIL 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const duplicateEmailError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
        error: new Error("Duplicate email"),
      });

      mockUserCommandRepo.createResidentUser.mockRejectedValue(
        duplicateEmailError,
      );

      await expect(
        service.signUpResidentUser(residentUserDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_EMAIL,
      });
    });

    test("signUpResidentUser 실패: 이미 존재하는 닉네임이라면 DUPLICATE_CONTACT 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findByUsername.mockResolvedValue(null);

      const duplicateContactError = new TechnicalException({
        type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        error: new Error("Duplicate contact"),
      });

      mockUserCommandRepo.createResidentUser.mockRejectedValue(
        duplicateContactError,
      );

      await expect(
        service.signUpResidentUser(residentUserDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_CONTACT,
      });
    });
  });

  describe("updateMyAvatar 함수 확인", () => {
    const dto = {
      userId: "user-1",
      role: UserRole.USER,
      body: { avatarImage: { filename: "new.jpg" } },
    } as updateAvatarReqDTO;

    const mockUser = { id: "user-1", avatar: "old.jpg" } as User;

    test("성공: 낙관적 락을 사용하여 아바타를 업데이트해야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);
      jest
        .spyOn(UserEntity, "updateAvatar")
        .mockReturnValue({ ...mockUser, avatar: "new.jpg" });
      mockUserCommandRepo.update.mockResolvedValue({
        ...mockUser,
        avatar: "new.jpg",
      });

      const result = await service.updateMyAvatar(dto);

      expect(result.avatar).toBe("new.jpg");
      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith("user-1");
      expect(mockUserCommandRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ avatar: "new.jpg" }),
      );
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ useOptimisticLock: true }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.updateMyAvatar(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: role이 ADMIN과 USER 이외의 것일 경우 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN } as any;

      await expect(service.updateMyAvatar(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 유저를 찾을 수 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(service.updateMyAvatar(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test("실패: 낙관적 락 충돌(버전 불일치)이 발생하면 비즈니스 에러로 변환하여 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);

      jest
        .spyOn(UserEntity, "updateAvatar")
        .mockReturnValue({ ...mockUser, avatar: "new.jpg" });

      const optimisticLockError = new TechnicalException({
        type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        error: new Error("Optimistic lock failed"),
      });
      mockUserCommandRepo.update.mockRejectedValue(optimisticLockError);

      await expect(service.updateMyAvatar(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
      });
      expect(mockUserCommandRepo.update).toHaveBeenCalled();
    });
  });

  describe("updateMyPassword 함수 확인", () => {
    const dto = {
      userId: "user-1",
      role: UserRole.USER,
      body: {
        password: "old_password",
        newPassword: "new_password",
      },
    } as updatePasswordReqDTO;

    const mockUser = { id: "user-1", password: "hashed_old_password" } as User;

    test("성공: 기존 비밀번호가 일치하면 새 비밀번호로 업데이트해야 한다. (낙관적 락 사용)", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);

      jest.spyOn(UserEntity, "isPasswordMatched").mockResolvedValue(true);

      jest.spyOn(UserEntity, "updatePassword").mockResolvedValue({
        ...mockUser,
        password: "hashed_new_password",
      });

      mockUserCommandRepo.update.mockResolvedValue({
        ...mockUser,
        password: "hashed_new_password",
      });

      const result = await service.updateMyPassword(dto);

      expect(UserEntity.isPasswordMatched).toHaveBeenCalledWith(
        mockUser,
        "old_password",
        mockHashManager,
      );
      expect(UserEntity.updatePassword).toHaveBeenCalledWith(
        mockUser,
        "new_password",
        mockHashManager,
      );
      expect(result.password).toBe("hashed_new_password");
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ useOptimisticLock: true }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.updateMyPassword(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: role이 ADMIN과 USER 이외의 것일 경우 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN } as any;

      await expect(service.updateMyPassword(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 유저를 찾을 수 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(service.updateMyPassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test("실패: 기존 비밀번호가 일치하지 않으면 INVALID_PASSWORD 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);
      jest.spyOn(UserEntity, "isPasswordMatched").mockResolvedValue(false);

      expect(mockUserCommandRepo.update).not.toHaveBeenCalled();
      await expect(service.updateMyPassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.INVALID_PASSWORD,
      });
    });

    test("실패: 낙관적 락 충돌(버전 불일치)이 발생하면 비즈니스 에러로 변환하여 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockUser);

      jest.spyOn(UserEntity, "isPasswordMatched").mockResolvedValue(true);

      jest.spyOn(UserEntity, "updatePassword").mockResolvedValue({
        ...mockUser,
        password: "hashed_new_password",
      });

      const optimisticLockError = new TechnicalException({
        type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        error: new Error("Optimistic lock failed"),
      });
      mockUserCommandRepo.update.mockRejectedValue(optimisticLockError);

      await expect(service.updateMyPassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
      });
      expect(mockUserCommandRepo.update).toHaveBeenCalled();
    });
  });

  describe("updateAdminData 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      params: { adminId: "admin-1" },
      body: {
        name: "New Admin Name",
        adminOf: { name: "New Apt" },
      },
    } as updateAdminDataReqDTO;

    const mockFoundUser = { id: "admin-1", role: UserRole.ADMIN } as User;

    test("성공: 슈퍼 관리자는 관리자의 정보를 수정할 수 있어야 한다. (아파트 중복 없음)", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockFoundUser);
      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue(null);

      const updatedUserMock = {
        ...mockFoundUser,
        name: "New Admin Name",
        adminOf: { name: "New Apt" },
      } as User;
      jest
        .spyOn(UserEntity, "updateAdminInfo")
        .mockReturnValue(updatedUserMock);
      mockUserCommandRepo.update.mockResolvedValue(updatedUserMock);

      const result = await service.updateAdminData(dto);

      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith(
        "admin-1",
        "update",
      );
      expect(mockUserCommandRepo.findApartmentByAdminOf).toHaveBeenCalledWith(
        dto.body.adminOf as AdminOf,
        "update",
      );
      expect(UserEntity.updateAdminInfo).toHaveBeenCalledWith(
        mockFoundUser,
        dto.body,
      );
      expect(result.name).toBe("New Admin Name");
      expect(result.adminOf?.name).toBe("New Apt");
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "RepeatableRead",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("성공: 이미 존재하는 아파트 정보라도, 수정 정보가 '수정 대상 유저'의 것과 동일하다면 성공해야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockFoundUser);

      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue({
        manager: { id: "admin-1" },
      });

      jest.spyOn(UserEntity, "updateAdminInfo").mockReturnValue(mockFoundUser);
      mockUserCommandRepo.update.mockResolvedValue(mockFoundUser);

      await expect(service.updateAdminData(dto)).resolves.not.toThrow();
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.updateAdminData(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: role이 SUPER_ADMIN이 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN } as any;

      await expect(service.updateAdminData(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 유저를 찾을 수 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(service.updateAdminData(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test("실패: 수정 대상 유저가 ADMIN이 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockFoundUser,
        role: UserRole.USER,
      });

      await expect(service.updateAdminData(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 다른 관리자가 이미 관리 중인 아파트 정보로 수정하려 하면 DUPLICATE_APARTMENT 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockFoundUser);

      mockUserCommandRepo.findApartmentByAdminOf.mockResolvedValue({
        admin: { id: "other-admin" },
      });

      await expect(service.updateAdminData(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.DUPLICATE_APARTMENT,
      });
    });
  });

  describe("updateAdminSignUpStatus 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      params: { adminId: "admin-1" },
      body: { joinStatus: "APPROVED" },
    } as updateUserSignUpStatusReqDTO;

    const mockAdmin = {
      id: "admin-1",
      role: UserRole.ADMIN,
      joinStatus: "PENDING",
      isActive: false,
    } as User;

    test("성공: 비관적 락(update)을 걸고 상태를 APPROVED로 변경해야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockAdmin);
      jest.spyOn(UserEntity, "approveJoin").mockReturnValue({
        ...mockAdmin,
        joinStatus: "APPROVED",
        isActive: true,
      });
      mockUserCommandRepo.update.mockResolvedValue({
        ...mockAdmin,
        joinStatus: "APPROVED",
        isActive: true,
      });

      const result = await service.updateAdminSignUpStatus(dto);

      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith(
        "admin-1",
        "update",
      );
      expect(result.joinStatus).toBe("APPROVED");
      expect(result.isActive).toBe(true);
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "ReadCommitted",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.updateAdminSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN };

      await expect(
        service.updateAdminSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 유저를 찾을 수 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(service.updateAdminSignUpStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test("실패: 수정 대상 유저가 ADMIN이 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockAdmin,
        role: UserRole.USER,
      });

      await expect(service.updateAdminSignUpStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });

  describe("updateAdminListSignUpStatus 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      body: {
        joinStatus: "REJECTED",
      },
    } as updateUserListSignUpStatusReqDTO;

    test("성공: 상태가 REJECTED면 관리자 목록을 잠그고 일괄 거절해야 한다.", async () => {
      await service.updateAdminListSignUpStatus(dto);

      expect(mockUserCommandRepo.lockManyAdmin).toHaveBeenCalledWith("update");
      expect(mockUserCommandRepo.rejectManyAdmin).toHaveBeenCalled();
      expect(mockUserCommandRepo.approveManyAdmin).not.toHaveBeenCalled();
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "RepeatableRead",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.updateAdminListSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN };

      expect(mockUserCommandRepo.lockManyAdmin).not.toHaveBeenCalled();
      await expect(
        service.updateAdminListSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });

  describe("updateResidentUserSignUpStatus 함수 확인", () => {
    const dto = {
      userId: "admin-1",
      role: UserRole.ADMIN,
      params: { residentId: "resident-1" },
      body: { joinStatus: "REJECTED" },
    } as updateUserSignUpStatusReqDTO;

    const mockResidentUser = {
      id: "resident-1",
      role: UserRole.USER,
      joinStatus: "PENDING",
      isActive: false,
    } as User;

    test("성공: 비관적 락(update)을 걸고 상태를 REJECTED로 변경해야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockResidentUser);
      jest.spyOn(UserEntity, "rejectJoin").mockReturnValue({
        ...mockResidentUser,
        joinStatus: "REJECTED",
        isActive: false,
      });
      mockUserCommandRepo.update.mockResolvedValue({
        ...mockResidentUser,
        joinStatus: "REJECTED",
        isActive: false,
      });

      const result = await service.updateResidentUserSignUpStatus(dto);

      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith(
        "resident-1",
        "update",
      );
      expect(result.joinStatus).toBe("REJECTED");
      expect(result.isActive).toBe(false);
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "ReadCommitted",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.updateResidentUserSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN };

      await expect(
        service.updateResidentUserSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 유저를 찾을 수 없으면 USER_NOT_FOUND 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateResidentUserSignUpStatus(dto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test("실패: 수정 대상 유저가 USER가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockResidentUser,
        role: UserRole.ADMIN,
      });

      await expect(
        service.updateResidentUserSignUpStatus(dto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });

  describe("updateResidentUserListSignUpStatus 함수 확인", () => {
    const dto = {
      userId: "admin-1",
      role: UserRole.ADMIN,
      body: {
        joinStatus: "APPROVED",
      },
    } as updateUserListSignUpStatusReqDTO;

    test("성공: 상태가 APPROVED면 입주민 목록을 잠그고 일괄 승인해야 한다.", async () => {
      await service.updateResidentUserListSignUpStatus(dto);

      expect(mockUserCommandRepo.lockManyResidentUser).toHaveBeenCalledWith(
        "update",
      );
      expect(mockUserCommandRepo.approveManyResidentUser).toHaveBeenCalled();
      expect(mockUserCommandRepo.rejectManyResidentUser).not.toHaveBeenCalled();
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "RepeatableRead",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.updateResidentUserListSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });

    test("실패: 호출자가 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN };

      expect(mockUserCommandRepo.lockManyResidentUser).not.toHaveBeenCalled();
      await expect(
        service.updateResidentUserListSignUpStatus(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
    });
  });

  describe("deleteAdmin 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
      params: { adminId: "admin-1" },
    } as deleteAdminReqDTO;

    const mockAdmin = { id: "admin-1", role: UserRole.ADMIN } as User;

    test("성공: 슈퍼 관리자는 관리자 계정을 삭제할 수 있어야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(mockAdmin);

      await service.deleteAdmin(dto);

      expect(mockUserCommandRepo.findById).toHaveBeenCalledWith("admin-1");
      expect(mockUserCommandRepo.deleteAdmin).toHaveBeenCalledWith("admin-1");
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "ReadCommitted",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("성공: 삭제하려는 유저가 이미 존재하지 않으면(null), 아무 작업 없이 종료해야 한다. (멱등성 보장)", async () => {
      mockUserCommandRepo.findById.mockResolvedValue(null);

      await service.deleteAdmin(dto);

      expect(mockUserCommandRepo.deleteAdmin).not.toHaveBeenCalled();
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(service.deleteAdmin(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.deleteAdmin).not.toHaveBeenCalled();
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN } as any;

      await expect(service.deleteAdmin(invalidDto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.deleteAdmin).not.toHaveBeenCalled();
    });

    test("실패: 삭제 대상 유저가 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      mockUserCommandRepo.findById.mockResolvedValue({
        ...mockAdmin,
        role: UserRole.USER,
      });

      await expect(service.deleteAdmin(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.deleteAdmin).not.toHaveBeenCalled();
    });
  });

  describe("deleteRejectedAdmins 함수 확인", () => {
    const dto = {
      userId: "super-1",
      role: UserRole.SUPER_ADMIN,
    } as deleteRejectedUsersReqDTO;

    test("성공: 슈퍼 관리자는 거절된 관리자 목록을 잠그고 일괄 삭제해야 한다.", async () => {
      await service.deleteRejectedAdmins(dto);

      expect(mockUserCommandRepo.lockManyAdmin).toHaveBeenCalledWith("update");
      expect(mockUserCommandRepo.deleteManyAdmin).toHaveBeenCalled();
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "ReadCommitted",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.deleteRejectedAdmins(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.lockManyAdmin).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.deleteManyAdmin).not.toHaveBeenCalled();
    });

    test("실패: 호출자가 슈퍼 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.ADMIN };

      await expect(
        service.deleteRejectedAdmins(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.lockManyAdmin).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.deleteManyAdmin).not.toHaveBeenCalled();
    });
  });

  describe("deleteRejectedResidentUsers 함수 확인", () => {
    const dto = {
      userId: "admin-1",
      role: UserRole.ADMIN,
    } as deleteRejectedUsersReqDTO;

    test("성공: 관리자는 거절된 입주민 목록을 잠그고 일괄 삭제해야 한다.", async () => {
      await service.deleteRejectedResidentUsers(dto);

      expect(mockUserCommandRepo.lockManyResidentUser).toHaveBeenCalledWith(
        "update",
      );
      expect(mockUserCommandRepo.deleteManyResidentUser).toHaveBeenCalled();
      expect(mockUnitOfWork.doTx).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          transactionOptions: expect.objectContaining({
            isolationLevel: "ReadCommitted",
          }),
          useOptimisticLock: false,
        }),
      );
    });

    test("실패: userId 또는 role이 없으면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, userId: undefined, role: undefined } as any;

      await expect(
        service.deleteRejectedResidentUsers(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.lockManyResidentUser).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.deleteManyResidentUser).not.toHaveBeenCalled();
    });

    test("실패: 호출자가 관리자가 아니면 FORBIDDEN 에러를 던져야 한다.", async () => {
      const invalidDto = { ...dto, role: UserRole.SUPER_ADMIN };

      await expect(
        service.deleteRejectedResidentUsers(invalidDto),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.FORBIDDEN,
      });
      expect(mockUserCommandRepo.lockManyResidentUser).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.deleteManyResidentUser).not.toHaveBeenCalled();
    });
  });
});
