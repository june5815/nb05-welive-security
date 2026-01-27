import {
  UserEntity,
  UserRole,
  JoinStatus,
  User,
} from "../../../_modules/users/domain/user.entity";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";

describe("UserEntity Unit Test", () => {
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

  describe("createSuperAdmin 함수 확인", () => {
    test("슈퍼 관리자는 생성 즉시 계정 승인 상태여야 한다.", async () => {
      (mockHashManager.hash as jest.Mock).mockResolvedValue("hashed_password");
      const props = {
        username: "super",
        password: "password",
        email: "super@test.com",
        contact: "01012345678",
        name: "Super",
        hashManager: mockHashManager,
      };

      const user = await UserEntity.createSuperAdmin(props);

      expect(mockHashManager.hash).toHaveBeenCalledWith("password");
      expect(user.username).toBe("super");
      expect(user.email).toBe("super@test.com");
      expect(user.contact).toBe("01012345678");
      expect(user.name).toBe("Super");
      expect(user.password).toBe("hashed_password");
      expect(user.role).toBe(UserRole.SUPER_ADMIN);
      expect(user.joinStatus).toBe(JoinStatus.APPROVED);
      expect(user.isActive).toBe(true);
    });
  });

  describe("createAdmin 함수 확인", () => {
    test("일반 관리자는 생성 시 계정 대기 상태여야 한다.", async () => {
      (mockHashManager.hash as jest.Mock).mockResolvedValue("hashed_password");
      const props = {
        username: "admin",
        password: "password",
        email: "admin@test.com",
        contact: "01011111111",
        name: "Admin",
        hashManager: mockHashManager,
        adminOf: {
          name: "Test Apt",
          address: "Seoul",
          description: "description",
          officeNumber: "021234567",
          buildingNumberFrom: 1,
          buildingNumberTo: 5,
          floorCountPerBuilding: 20,
          unitCountPerFloor: 4,
        },
      };

      const user = await UserEntity.createAdmin(props);

      expect(mockHashManager.hash).toHaveBeenCalledWith("password");
      expect(user.username).toBe("admin");
      expect(user.email).toBe("admin@test.com");
      expect(user.contact).toBe("01011111111");
      expect(user.name).toBe("Admin");
      expect(user.adminOf).toEqual(props.adminOf);
      expect(user.password).toBe("hashed_password");
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.joinStatus).toBe(JoinStatus.PENDING);
      expect(user.isActive).toBe(false);
    });
  });

  describe("createResidentUser 함수 확인", () => {
    test("입주민은 생성 시 계정 대기 상태여야 한다.", async () => {
      (mockHashManager.hash as jest.Mock).mockResolvedValue("hashed_password");
      const props = {
        username: "resident",
        password: "password",
        email: "resident@test.com",
        contact: "01022222222",
        name: "Resident",
        hashManager: mockHashManager,
        resident: {
          apartmentId: "Test Apt ID",
          building: 5,
          unit: 5051,
        },
      };

      const user = await UserEntity.createResidentUser(props);

      expect(mockHashManager.hash).toHaveBeenCalledWith("password");
      expect(user.username).toBe("resident");
      expect(user.email).toBe("resident@test.com");
      expect(user.contact).toBe("01022222222");
      expect(user.name).toBe("Resident");
      expect(user.resident).toEqual(props.resident);
      expect(user.password).toBe("hashed_password");
      expect(user.role).toBe(UserRole.USER);
      expect(user.joinStatus).toBe(JoinStatus.PENDING);
      expect(user.isActive).toBe(false);
    });
  });

  describe("restore 함수들 확인", () => {
    const baseProps = {
      id: "test-user-id",
      username: "test",
      password: "hashed_password",
      email: "test@test.com",
      contact: "01012345678",
      name: "Test",
      avatar: undefined,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    } as User;

    test("restoreSuperAdmin: 전달받은 인자를 그대로 복원해야 한다.", async () => {
      const user = {
        ...baseProps,
        role: UserRole.SUPER_ADMIN,
      };

      const result = UserEntity.restoreSuperAdmin({
        ...baseProps,
        role: UserRole.SUPER_ADMIN,
      });

      expect(result).toEqual(user);
    });

    test("restoreAdmin: 전달받은 인자를 그대로 복원해야 한다.", async () => {
      const user = {
        ...baseProps,
        role: UserRole.ADMIN,
        adminOf: {
          id: "test-apt-id",
          name: "Test Apt",
          address: "address",
          description: "description",
          officeNumber: "021234567",
          buildingNumberFrom: 1,
          buildingNumberTo: 5,
          floorCountPerBuilding: 20,
          unitCountPerFloor: 4,
        },
      };

      const result = UserEntity.restoreAdmin(user as any);

      expect(result).toEqual(user);
    });

    test("restoreResidentUser: 전달받은 인자를 그대로 복원해야 한다.", async () => {
      const user = {
        ...baseProps,
        role: UserRole.USER,
        resident: {
          id: "test-res-id",
          apartmentId: "test-apt-id",
          building: 5,
          unit: 5051,
          isHouseholder: true,
        },
      };

      const result = UserEntity.restoreResidentUser(user as any);

      expect(result).toEqual(user);
    });
  });

  describe("Approve / Reject 함수 확인", () => {
    const pendingUser: User = {
      id: "test-user-id",
      username: "user",
      password: "password",
      email: "test@test.com",
      contact: "01087654321",
      name: "Test",
      role: UserRole.SUPER_ADMIN,
      avatar: undefined,
      joinStatus: JoinStatus.PENDING,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      adminOf: {
        name: "Apt",
        address: "address",
        description: "description",
        officeNumber: "021234567",
        buildingNumberFrom: 1,
        buildingNumberTo: 3,
        floorCountPerBuilding: 15,
        unitCountPerFloor: 4,
      },
      resident: {
        apartmentId: "AptID",
        building: 2,
        unit: 2011,
      },
    };

    test("approveJoin: 유저 상태를 APPROVED 및 Active로 변경해야 한다. 다른 정보는 변경되어선 안 된다.", () => {
      const approvedUser = UserEntity.approveJoin(pendingUser);

      expect(approvedUser.id).toBe(pendingUser.id);
      expect(approvedUser.username).toBe(pendingUser.username);
      expect(approvedUser.password).toBe(pendingUser.password);
      expect(approvedUser.email).toBe(pendingUser.email);
      expect(approvedUser.contact).toBe(pendingUser.contact);
      expect(approvedUser.name).toBe(pendingUser.name);
      expect(approvedUser.role).toBe(pendingUser.role);
      expect(approvedUser.avatar).toBe(pendingUser.avatar);
      expect(approvedUser.createdAt).toBe(pendingUser.createdAt);
      expect(approvedUser.updatedAt).toBe(pendingUser.updatedAt);
      expect(approvedUser.version).toBe(pendingUser.version);
      expect(approvedUser.adminOf).toEqual(pendingUser.adminOf);
      expect(approvedUser.resident).toEqual(pendingUser.resident);

      expect(approvedUser.joinStatus).toBe(JoinStatus.APPROVED);
      expect(approvedUser.isActive).toBe(true);
    });

    test("rejectJoin: 유저 상태를 REJECTED 및 Inactive로 변경해야 한다. 다른 정보는 변경되어선 안 된다.", () => {
      const rejectedUser = UserEntity.rejectJoin(pendingUser);

      expect(rejectedUser.id).toBe(pendingUser.id);
      expect(rejectedUser.username).toBe(pendingUser.username);
      expect(rejectedUser.password).toBe(pendingUser.password);
      expect(rejectedUser.email).toBe(pendingUser.email);
      expect(rejectedUser.contact).toBe(pendingUser.contact);
      expect(rejectedUser.name).toBe(pendingUser.name);
      expect(rejectedUser.role).toBe(pendingUser.role);
      expect(rejectedUser.avatar).toBe(pendingUser.avatar);
      expect(rejectedUser.createdAt).toBe(pendingUser.createdAt);
      expect(rejectedUser.updatedAt).toBe(pendingUser.updatedAt);
      expect(rejectedUser.version).toBe(pendingUser.version);
      expect(rejectedUser.adminOf).toEqual(pendingUser.adminOf);
      expect(rejectedUser.resident).toEqual(pendingUser.resident);

      expect(rejectedUser.joinStatus).toBe(JoinStatus.REJECTED);
      expect(rejectedUser.isActive).toBe(false);
    });
  });

  describe("updateAvatar 함수 확인", () => {
    const persistUser: User = {
      id: "test-user-id",
      username: "user",
      password: "password",
      email: "test@test.com",
      contact: "01087654321",
      name: "Test",
      role: UserRole.SUPER_ADMIN,
      avatar: undefined,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      adminOf: {
        name: "Apt",
        address: "address",
        description: "description",
        officeNumber: "021234567",
        buildingNumberFrom: 1,
        buildingNumberTo: 3,
        floorCountPerBuilding: 15,
        unitCountPerFloor: 4,
      },
      resident: {
        apartmentId: "AptID",
        building: 2,
        unit: 2011,
      },
    };

    test("아바타 정보가 변경되어야 한다. 다른 정보는 변경되어선 안 된다.", () => {
      const updatedUser = UserEntity.updateAvatar(persistUser, "new-avatar");

      expect(updatedUser.id).toBe(persistUser.id);
      expect(updatedUser.username).toBe(persistUser.username);
      expect(updatedUser.password).toBe(persistUser.password);
      expect(updatedUser.email).toBe(persistUser.email);
      expect(updatedUser.contact).toBe(persistUser.contact);
      expect(updatedUser.name).toBe(persistUser.name);
      expect(updatedUser.role).toBe(persistUser.role);
      expect(updatedUser.joinStatus).toBe(JoinStatus.APPROVED);
      expect(updatedUser.isActive).toBe(true);
      expect(updatedUser.createdAt).toBe(persistUser.createdAt);
      expect(updatedUser.updatedAt).toBe(persistUser.updatedAt);
      expect(updatedUser.version).toBe(persistUser.version);
      expect(updatedUser.adminOf).toEqual(persistUser.adminOf);
      expect(updatedUser.resident).toEqual(persistUser.resident);

      expect(updatedUser.avatar).toBe("new-avatar");
    });
  });

  describe("updateAdminInfo 함수 확인", () => {
    test("관리자 정보(adminOf)의 일부만 수정해도 기존 정보와 병합(Merge)되어야 한다.", () => {
      const persistUser: User = {
        username: "admin",
        password: "password",
        role: UserRole.ADMIN,
        // 실제 변경되는 데이터는 아래 부분
        email: "old@test.com",
        contact: "01011111111",
        name: "Old Name",
        adminOf: {
          name: "Old Apt Name",
          address: "Old Address",
          description: "Old description",
          officeNumber: "021234567",
          // 여기까지만 변경되고, 아래의 것은 변경되지 않는다
          buildingNumberFrom: 1,
          buildingNumberTo: 2,
          floorCountPerBuilding: 10,
          unitCountPerFloor: 2,
        },
      };

      const updateProps = {
        name: "New Name",
        adminOf: {
          name: "New Apt Name",
        },
      };

      const updatedUser = UserEntity.updateAdminInfo(persistUser, updateProps);

      expect(updatedUser.name).toBe("New Name");
      expect(updatedUser.adminOf?.name).toBe("New Apt Name");

      // 변경되지 않은 기존 데이터 확인
      expect(updatedUser.username).toBe("admin");
      expect(updatedUser.password).toBe("password");
      expect(updatedUser.role).toBe(UserRole.ADMIN);
      expect(updatedUser.email).toBe("old@test.com");
      expect(updatedUser.contact).toBe("01011111111");
      expect(updatedUser.adminOf?.address).toBe("Old Address");
      expect(updatedUser.adminOf?.description).toBe("Old description");
      expect(updatedUser.adminOf?.officeNumber).toBe("021234567");
      expect(updatedUser.adminOf?.buildingNumberFrom).toBe(1);
      expect(updatedUser.adminOf?.buildingNumberTo).toBe(2);
      expect(updatedUser.adminOf?.floorCountPerBuilding).toBe(10);
      expect(updatedUser.adminOf?.unitCountPerFloor).toBe(2);
    });
  });

  describe("updatePassword 함수 확인", () => {
    test("새로운 비밀번호를 해싱하여 저장해야 한다.", async () => {
      const user: User = {
        username: "user",
        password: "old_hashed_password",
        email: "user@test.com",
        contact: "01012345678",
        name: "User",
      };
      (mockHashManager.hash as jest.Mock).mockResolvedValue(
        "new_hashed_password",
      );

      const updatedUser = await UserEntity.updatePassword(
        user,
        "new_password",
        mockHashManager,
      );

      expect(mockHashManager.hash).toHaveBeenCalledWith("new_password");
      expect(updatedUser.password).toBe("new_hashed_password");
    });
  });

  describe("isPasswordMatched 함수 확인", () => {
    test("비밀번호가 일치하면 true를 반환해야 한다.", async () => {
      const user: User = {
        username: "user",
        password: "hashed_password",
        email: "user@test.com",
        contact: "01012345678",
        name: "User",
      };
      (mockHashManager.compare as jest.Mock).mockResolvedValue(true);

      const result = await UserEntity.isPasswordMatched(
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

    test("유저에게 비밀번호가 없으면 false를 반환해야 한다.", async () => {
      const user: User = {
        username: "user",
        password: "", // password 없음
        email: "user@test.com",
        contact: "01012345678",
        name: "User",
      };

      const result = await UserEntity.isPasswordMatched(
        user,
        "password",
        mockHashManager,
      );

      expect(result).toBe(false);
      // compare 메소드가 호출되면 안 됨
      expect(mockHashManager.compare).not.toHaveBeenCalled();
    });
  });
});
