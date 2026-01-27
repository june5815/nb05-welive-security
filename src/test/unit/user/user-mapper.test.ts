import { UserMapper } from "../../../_infra/mappers/user.mapper";
import {
  UserRole,
  JoinStatus,
  User,
} from "../../../_modules/users/domain/user.entity";

describe("UserMapper Unit Test", () => {
  beforeAll(() => {});
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("toCreateSuperAdmin 함수 확인", () => {
    test("도메인 엔티티를 슈퍼 관리자 생성용 Prisma Input으로 변환해야 한다.", () => {
      const entity = {
        username: "super",
        email: "super@test.com",
        contact: "01012345678",
        name: "Super",
        password: "hashed_password",
      } as User;

      const result = UserMapper.toCreateSuperAdmin(entity);

      expect(result.username).toBe("super");
      expect(result.email).toBe("super@test.com");
      expect(result.contact).toBe("01012345678");
      expect(result.name).toBe("Super");
      expect(result.password).toBe("hashed_password");
      expect(result.role).toBe(UserRole.SUPER_ADMIN);
      expect(result.joinStatus).toBe(JoinStatus.APPROVED);
      expect(result.isActive).toBe(true);
    });
  });

  describe("toCreateAdmin 함수 확인", () => {
    test("도메인 엔티티를 관리자 생성용 Prisma Input으로 변환해야 한다. (adminOf 포함)", () => {
      const entity = {
        username: "admin",
        email: "admin@test.com",
        contact: "01011111111",
        name: "Admin",
        password: "hashed_password",
        adminOf: {
          name: "Apt",
          address: "address",
          officeNumber: "021234567",
          description: "description",
          buildingNumberFrom: 1,
          buildingNumberTo: 10,
          floorCountPerBuilding: 20,
          unitCountPerFloor: 4,
        },
      } as User;

      const result = UserMapper.toCreateAdmin(entity);

      expect(result.username).toBe("admin");
      expect(result.email).toBe("admin@test.com");
      expect(result.contact).toBe("01011111111");
      expect(result.name).toBe("Admin");
      expect(result.password).toBe("hashed_password");
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.joinStatus).toBe(JoinStatus.PENDING);
      expect(result.isActive).toBe(false);
      expect(result.adminOf?.connectOrCreate?.create.name).toBe("Apt");
      expect(
        result.adminOf?.connectOrCreate?.where.name_address_officeNumber?.name,
      ).toBe("Apt");
      expect(
        result.adminOf?.connectOrCreate?.where.name_address_officeNumber
          ?.address,
      ).toBe("address");
      expect(
        result.adminOf?.connectOrCreate?.where.name_address_officeNumber
          ?.officeNumber,
      ).toBe("021234567");
      expect(result.adminOf?.connectOrCreate?.create.buildingNumberFrom).toBe(
        1,
      );
      expect(result.adminOf?.connectOrCreate?.create.buildingNumberTo).toBe(10);
      expect(
        result.adminOf?.connectOrCreate?.create.floorCountPerBuilding,
      ).toBe(20);
      expect(result.adminOf?.connectOrCreate?.create.unitCountPerFloor).toBe(4);
    });
  });

  describe("toCreateUser 함수 확인", () => {
    const entity = {
      username: "user",
      email: "user@test.com",
      contact: "01022222222",
      name: "User",
      password: "hashed_password",
      resident: {
        apartmentId: "apt-1",
        building: 1,
        unit: 1001,
      },
    } as User;

    test("관리자에 의해 등록된 입주민 정보가 있으면 APPROVED 상태로 연결해야 한다.", () => {
      const persistResidentId = "res-1";

      const result = UserMapper.toCreateUser(entity, persistResidentId);

      expect(result.username).toBe("user");
      expect(result.email).toBe("user@test.com");
      expect(result.contact).toBe("01022222222");
      expect(result.name).toBe("User");
      expect(result.password).toBe("hashed_password");
      expect(result.role).toBe(UserRole.USER);
      expect(result.joinStatus).toBe(JoinStatus.APPROVED);
      expect(result.isActive).toBe(true);
      expect(result.resident?.connect?.id).toBe(persistResidentId);
    });

    test("관리자에 의해 등록되지 않은 입주민이 가입할 경우 PENDING 상태로 새로 생성해야 한다.", () => {
      const result = UserMapper.toCreateUser(entity);

      expect(result.username).toBe("user");
      expect(result.email).toBe("user@test.com");
      expect(result.contact).toBe("01022222222");
      expect(result.name).toBe("User");
      expect(result.password).toBe("hashed_password");
      expect(result.role).toBe(UserRole.USER);
      expect(result.joinStatus).toBe(JoinStatus.PENDING);
      expect(result.isActive).toBe(false);
      expect(result.resident?.create?.apartment?.connect?.id).toBe("apt-1");
      expect(result.resident?.create?.building).toBe(1);
      expect(result.resident?.create?.unit).toBe(1001);
    });
  });

  describe("toUpdate 함수 확인", () => {
    test("entity의 변경 사항들이 반영되어야 한다.", () => {
      const entity = {
        email: "new@test.com",
        contact: "01012345678",
        name: "Test",
        password: "new_password",
        avatar: "new_avatar",
        joinStatus: JoinStatus.APPROVED,
        isActive: true,
      } as User;

      const result = UserMapper.toUpdate(entity);

      expect(result.email).toBe("new@test.com");
      expect(result.contact).toBe("01012345678");
      expect(result.name).toBe("Test");
      expect(result.password).toBe("new_password");
      expect(result.avatar).toBe("new_avatar");
      expect(result.joinStatus).toBe(JoinStatus.APPROVED);
      expect(result.isActive).toBe(true);
    });

    test("슈퍼 관리자가 수정한 관리자의 adminOf 정보도 업데이트에 포함되어야 한다.", () => {
      const entity = {
        // role 데이터는 변경을 위한 것이 아닌 검증을 위해 필요한 것
        role: UserRole.ADMIN,
        adminOf: {
          name: "New Apt",
          address: "New address",
          officeNumber: "021234567",
          description: "New description",
        },
      } as User;

      const result = UserMapper.toUpdate(entity);

      expect(result.adminOf?.update?.name).toBe("New Apt");
      expect(result.adminOf?.update?.address).toBe("New address");
      expect(result.adminOf?.update?.officeNumber).toBe("021234567");
      expect(result.adminOf?.update?.description).toBe("New description");
    });
  });

  describe("toEntity 함수들 확인", () => {
    const prismaUserBase = {
      id: "test-user-id",
      username: "test",
      password: "password",
      email: "test@test.com",
      contact: "01012345678",
      name: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isActive: true,
      joinStatus: "APPROVED",
    };

    test("toSuperAdminEntity 함수 확인", () => {
      const prismaUser = { ...prismaUserBase, role: "SUPER_ADMIN" } as any;

      const result = UserMapper.toSuperAdminEntity(prismaUser);

      expect(result).toEqual({ ...prismaUser });
    });

    test("toAdminEntity 함수 확인", () => {
      const prismaUser = {
        ...prismaUserBase,
        role: "ADMIN",
        adminOf: {
          id: "apt-1",
          name: "Apt",
          address: "address",
          officeNumber: "021234567",
          description: "description",
          buildingNumberFrom: 1,
          buildingNumberTo: 10,
          floorCountPerBuilding: 20,
          unitCountPerFloor: 4,
          adminId: "test-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      } as any;

      const result = UserMapper.toAdminEntity(prismaUser);

      expect(result).toEqual({ ...prismaUser });
    });

    test("toUserEntity 함수 확인", () => {
      const prismaUser = {
        ...prismaUserBase,
        role: "USER",
        resident: {
          id: "res-1",
          name: "Test",
          email: "test@test.com",
          contact: "01012345678",
          userId: "test-user-id",
          apartmentId: "apt-1",
          building: 1,
          unit: 1001,
          isHouseholder: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      } as any;

      const result = UserMapper.toUserEntity(prismaUser);

      expect(result).toEqual({ ...prismaUser });
    });
  });
});
