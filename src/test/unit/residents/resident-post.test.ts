import {
  ResidentCommandService,
  IResidentCommandService,
  CreateResidentDTO,
} from "../../../_modules/residents/usecases/resident-command.usecase";
import { IResidentCommandRepo } from "../../../_common/ports/repos/resident/resident-command.repo.interface";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  HouseholdMember,
  UserType,
} from "../../../_modules/residents/domain/resident.type";
import { UserRole } from "../../../_modules/users/domain/user.entity";

describe("ResidentCommandService - POST Unit Tests", () => {
  let residentCommandService: IResidentCommandService;
  let mockCommandRepo: jest.Mocked<IResidentCommandRepo>;
  let mockQueryRepo: jest.Mocked<IResidentQueryRepo>;

  const mockHousehold = {
    id: "household-1",
    building: 1,
    unit: 101,
  };

  const mockCreatedMember: HouseholdMember = {
    id: "member-new",
    householdId: "household-1",
    userId: "user-new",
    userType: UserType.RESIDENT,
    email: "newresident@example.com",
    contact: "010-9999-9999",
    name: "박영수",
    isHouseholder: true,
    createdAt: new Date("2026-02-04T10:04:05.809Z"),
    updatedAt: new Date("2026-02-04T10:04:05.809Z"),
  };

  beforeEach(() => {
    mockCommandRepo = {
      createHouseholdMember: jest.fn(),
      createManyHouseholdMembers: jest.fn(),
      updateHouseholdMember: jest.fn(),
      deleteHouseholdMember: jest.fn(),
    } as unknown as jest.Mocked<IResidentCommandRepo>;

    mockQueryRepo = {
      findHouseholdByBuildingAndUnit: jest.fn(),
      findHouseholdMemberByEmail: jest.fn(),
      findHouseholdMembers: jest.fn(),
      findHouseholdMemberById: jest.fn(),
    } as unknown as jest.Mocked<IResidentQueryRepo>;

    residentCommandService = ResidentCommandService(
      mockCommandRepo,
      mockQueryRepo,
    );

    // 기본 설정: household 조회 성공, 이메일 중복 없음
    mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
      mockHousehold as any,
    );
    mockQueryRepo.findHouseholdMemberByEmail?.mockResolvedValue(null);
    mockCommandRepo.createHouseholdMember?.mockResolvedValue(mockCreatedMember);
  });

  describe("성공 케이스 (201 Created)", () => {
    it("should register a new household member successfully", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toEqual(mockCreatedMember);
      expect(result.id).toBe("member-new");
      expect(result.email).toBe("newresident@example.com");
    });

    it("should return createdAt in ISO 8601 format", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should register non-householder member", async () => {
      const nonHouseholderMember = {
        ...mockCreatedMember,
        isHouseholder: false,
      };

      mockCommandRepo.createHouseholdMember?.mockResolvedValue(
        nonHouseholderMember,
      );

      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "nonhouseholder@example.com",
        contact: "010-1111-1111",
        name: "김철수",
        isHouseholder: false,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result.isHouseholder).toBe(false);
    });

    it("should return correct response structure with all fields", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("contact");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("isHouseholder");
      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("householdId");
      expect(result).toHaveProperty("userType");
    });
  });

  describe("검증 실패 케이스", () => {
    it("should throw BusinessException when email is empty", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when name is empty", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when contact is empty", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when building is 0", async () => {
      const dto: CreateResidentDTO = {
        building: 0,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when unit is 0", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 0,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when email is only whitespace", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "   ",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when name is only whitespace", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "   ",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw BusinessException when contact is only whitespace", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "   ",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("권한 검증 케이스", () => {
    it("should throw FORBIDDEN when user role is not ADMIN", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "user-1",
          "apartment-1",
          UserRole.USER,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN when user role is USER", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "user-1",
          "apartment-1",
          UserRole.USER,
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("데이터 충돌 및 중복 케이스", () => {
    it("should throw DUPLICATE_EMAIL when email already exists", async () => {
      mockQueryRepo.findHouseholdMemberByEmail?.mockResolvedValue({
        id: "existing-member",
        email: "newresident@example.com",
      } as any);

      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw error when household does not exist", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(null);

      const dto: CreateResidentDTO = {
        building: 99,
        unit: 999,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      await expect(
        residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("엣지 케이스 및 범위 검증", () => {
    it("should accept minimum building number 1", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toBeDefined();
    });

    it("should accept maximum building number 99", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue({
        id: "household-99",
        building: 99,
        unit: 101,
      } as any);

      const dto: CreateResidentDTO = {
        building: 99,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toBeDefined();
    });

    it("should accept minimum unit number 1", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue({
        id: "household-unit-1",
        building: 1,
        unit: 1,
      } as any);

      const dto: CreateResidentDTO = {
        building: 1,
        unit: 1,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toBeDefined();
    });

    it("should accept high unit numbers", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue({
        id: "household-high",
        building: 1,
        unit: 9999,
      } as any);

      const dto: CreateResidentDTO = {
        building: 1,
        unit: 9999,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toBeDefined();
    });

    it("should handle Korean names correctly", async () => {
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "김철수박진영",
        isHouseholder: true,
      };

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          dto,
          "admin-user-1",
          "apartment-1",
          UserRole.ADMIN,
        );

      expect(result).toBeDefined();
    });
  });

  describe("요청 파라미터 검증", () => {
    it("should pass correct apartmentId to query repository", async () => {
      const apartmentId = "specific-apartment-id";
      const dto: CreateResidentDTO = {
        building: 1,
        unit: 101,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        mockHousehold as any,
      );

      await residentCommandService.registerHouseholdMemberByAdmin(
        dto,
        "admin-user-1",
        apartmentId,
        UserRole.ADMIN,
      );

      expect(mockQueryRepo.findHouseholdByBuildingAndUnit).toHaveBeenCalledWith(
        apartmentId,
        1,
        101,
      );
    });

    it("should pass correct building and unit to query repository", async () => {
      const dto: CreateResidentDTO = {
        building: 5,
        unit: 203,
        email: "newresident@example.com",
        contact: "010-9999-9999",
        name: "박영수",
        isHouseholder: true,
      };

      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue({
        id: "household-5-203",
        building: 5,
        unit: 203,
      } as any);

      await residentCommandService.registerHouseholdMemberByAdmin(
        dto,
        "admin-user-1",
        "apartment-1",
        UserRole.ADMIN,
      );

      expect(mockQueryRepo.findHouseholdByBuildingAndUnit).toHaveBeenCalledWith(
        "apartment-1",
        5,
        203,
      );
    });
  });
});
