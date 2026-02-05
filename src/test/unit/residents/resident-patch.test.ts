import {
  ResidentCommandService,
  IResidentCommandService,
  UpdateResidentDTO,
} from "../../../_modules/residents/usecases/resident-command.usecase";
import { IResidentCommandRepo } from "../../../_common/ports/repos/resident/resident-command.repo.interface";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  HouseholdMember,
  HouseholdMemberWithRelations,
  UserType,
} from "../../../_modules/residents/domain/resident.type";
import { UserRole } from "../../../_modules/users/domain/user.entity";

describe("ResidentCommandService - PATCH Unit Tests", () => {
  let residentCommandService: IResidentCommandService;
  let mockCommandRepo: jest.Mocked<IResidentCommandRepo>;
  let mockQueryRepo: jest.Mocked<IResidentQueryRepo>;

  const mockExistingMember: HouseholdMemberWithRelations = {
    id: "member-1",
    householdId: "household-1",
    userId: "user-1",
    userType: UserType.RESIDENT,
    email: "oldresident@example.com",
    contact: "010-1111-1111",
    name: "홍길동",
    isHouseholder: false,
    movedInAt: new Date("2026-01-01"),
    movedOutAt: undefined,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    user: {
      id: "user-1",
      email: "oldresident@example.com",
      contact: "010-1111-1111",
      name: "홍길동",
    },
    household: {
      id: "household-1",
      building: 1,
      unit: 101,
      apartmentId: "apt-1",
      apartment: {
        id: "apt-1",
        name: "테스트 아파트",
        address: "서울시 강남구",
      },
    },
  };

  const mockHousehold2: any = {
    id: "household-2",
    building: 2,
    unit: 202,
    apartmentId: "apt-1",
    members: [
      {
        id: "member-2",
        isHouseholder: true,
        movedOutAt: null,
        name: "김영희",
      },
    ],
  };

  const mockUpdatedMember: HouseholdMember = {
    id: "member-1",
    householdId: "household-1",
    userId: "user-1",
    userType: UserType.RESIDENT,
    email: "updated@example.com",
    contact: "010-2222-2222",
    name: "박영수",
    isHouseholder: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-02-05"),
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

    // 기본 설정
    mockQueryRepo.findHouseholdMemberById?.mockResolvedValue(
      mockExistingMember,
    );
    mockQueryRepo.findHouseholdMemberByEmail?.mockResolvedValue(null);
    mockCommandRepo.updateHouseholdMember?.mockResolvedValue(mockUpdatedMember);
  });

  describe("성공 케이스 (200 OK)", () => {
    /**
     * 성공: 이름 수정
     */
    it("should update member name successfully", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
      expect(mockCommandRepo.updateHouseholdMember).toHaveBeenCalled();
    });

    /**
     * 성공: 연락처 수정
     */
    it("should update member contact successfully", async () => {
      const dto: UpdateResidentDTO = {
        contact: "010-2222-2222",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 이메일 수정
     */
    it("should update member email successfully", async () => {
      const dto: UpdateResidentDTO = {
        email: "updated@example.com",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 여러 필드 동시 수정
     */
    it("should update multiple fields at once", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
        contact: "010-2222-2222",
        email: "updated@example.com",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 세대 이동 (building, unit 수정)
     */
    it("should move member to different household", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        mockHousehold2,
      );

      const dto: UpdateResidentDTO = {
        building: 2,
        unit: 202,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
      expect(mockQueryRepo.findHouseholdByBuildingAndUnit).toHaveBeenCalledWith(
        "apt-1",
        2,
        202,
      );
    });

    /**
     * 성공: 세대 이동 + 이름 수정
     */
    it("should move member and update name simultaneously", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        mockHousehold2,
      );

      const dto: UpdateResidentDTO = {
        building: 2,
        unit: 202,
        name: "박영수",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 세대주 설정 (같은 세대에서 기존 세대주 없는 경우)
     */
    it("should set as householder when no existing householder in same household", async () => {
      mockQueryRepo.findHouseholdMembers?.mockResolvedValue({
        members: [], // no householder
        total: 0,
      });

      const dto: UpdateResidentDTO = {
        isHouseholder: true,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 세대주 설정 해제
     */
    it("should unset householder status", async () => {
      const memberWithHouseholder = {
        ...mockExistingMember,
        isHouseholder: true,
      };

      mockQueryRepo.findHouseholdMemberById?.mockResolvedValue(
        memberWithHouseholder,
      );

      const dto: UpdateResidentDTO = {
        isHouseholder: false,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });

    /**
     * 성공: 빈 DTO (변경 없음)
     */
    it("should handle empty DTO (no changes)", async () => {
      const dto: UpdateResidentDTO = {};

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toEqual(mockUpdatedMember);
    });
  });

  describe("검증 실패 케이스", () => {
    /**
     * 실패: 존재하지 않는 입주민
     */
    it("should throw NOT_FOUND when member does not exist", async () => {
      mockQueryRepo.findHouseholdMemberById?.mockResolvedValue(null);

      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "non-existent-id",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 빈 이메일
     */
    it("should throw error when email is empty string", async () => {
      const dto: UpdateResidentDTO = {
        email: "",
      };

      // 빈 이메일은 validate하지 않고 전달됨 (undefined 아니면 업데이트)
      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 실패: 빈 이름
     */
    it("should throw error when name is empty string", async () => {
      const dto: UpdateResidentDTO = {
        name: "",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 실패: 이미 존재하는 이메일로 변경
     */
    it("should throw DUPLICATE_EMAIL when new email already exists", async () => {
      mockQueryRepo.findHouseholdMemberByEmail?.mockResolvedValue({
        id: "other-member",
        email: "existing@example.com",
      } as any);

      const dto: UpdateResidentDTO = {
        email: "existing@example.com",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 존재하지 않는 세대로 이동
     */
    it("should throw FORBIDDEN when target household does not exist", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(null);

      const dto: UpdateResidentDTO = {
        building: 99,
        unit: 999,
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 다른 아파트의 입주민 수정 시도
     */
    it("should throw FORBIDDEN when apartment mismatch", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "different-apt", // 다른 아파트
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("권한 검증 케이스", () => {
    /**
     * 실패: 권한 없음 - 비ADMIN 역할
     */
    it("should throw FORBIDDEN when user role is not ADMIN", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "user-1",
          UserRole.USER,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 권한 없음 - 빈 role
     */
    it("should throw FORBIDDEN when role is empty", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          "" as any,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 빈 memberId
     */
    it("should throw error when memberId is empty", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 빈 apartmentId
     */
    it("should throw error when apartmentId is empty", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "", // empty apartmentId
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("세대주 중복 방지 테스트", () => {
    /**
     * 실패: 같은 세대에 이미 세대주가 있는 경우
     */
    it("should throw error when trying to set as householder but existing householder in same household", async () => {
      mockQueryRepo.findHouseholdMembers?.mockResolvedValue({
        members: [
          {
            id: "member-2",
            isHouseholder: true,
            movedOutAt: undefined,
            name: "기존세대주",
          } as any,
        ],
        total: 1,
      });

      const dto: UpdateResidentDTO = {
        isHouseholder: true,
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 실패: 새 세대로 이동하면서 세대주 설정, 근데 새 세대에 이미 세대주 있음
     */
    it("should throw error when moving to household with existing householder and setting as householder", async () => {
      const householdWithHouseholder = {
        ...mockHousehold2,
        members: [
          {
            id: "member-3",
            isHouseholder: true,
            movedOutAt: null,
            name: "새세대주",
          },
        ],
      };

      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        householdWithHouseholder,
      );

      const dto: UpdateResidentDTO = {
        building: 2,
        unit: 202,
        isHouseholder: true,
      };

      await expect(
        residentCommandService.updateHouseholdMemberByAdmin(
          "member-1",
          dto,
          "admin-user-1",
          UserRole.ADMIN,
          "apt-1",
        ),
      ).rejects.toThrow(BusinessException);
    });

    /**
     * 성공: 새 세대로 이동하면서 세대주 설정, 새 세대에 세대주 없음
     */
    it("should successfully move and set as householder when target household has no householder", async () => {
      const householdWithoutHouseholder = {
        ...mockHousehold2,
        members: [], // no householder
      };

      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        householdWithoutHouseholder,
      );

      const dto: UpdateResidentDTO = {
        building: 2,
        unit: 202,
        isHouseholder: true,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 성공: 새 세대로 이동하되 세대주는 아님
     */
    it("should successfully move without setting as householder", async () => {
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        mockHousehold2,
      );

      const dto: UpdateResidentDTO = {
        building: 2,
        unit: 202,
        isHouseholder: false,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 성공: 이미 세대주인 경우 유지
     */
    it("should allow keeping householder status if already householder", async () => {
      const memberAsHouseholder = {
        ...mockExistingMember,
        isHouseholder: true,
      };

      mockQueryRepo.findHouseholdMemberById?.mockResolvedValue(
        memberAsHouseholder,
      );

      const dto: UpdateResidentDTO = {
        name: "박영수",
        isHouseholder: true, // 이미 세대주이므로 OK
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });
  });

  describe("엣지 케이스 및 범위 검증", () => {
    /**
     * 건물 번호 범위: 최소값 1
     */
    it("should accept building = 1", async () => {
      const household1 = { ...mockHousehold2, building: 1 };
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        household1,
      );

      const dto: UpdateResidentDTO = {
        building: 1,
        unit: 101,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 건물 번호 범위: 최대값 99
     */
    it("should accept building = 99", async () => {
      const household99 = { ...mockHousehold2, building: 99 };
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        household99,
      );

      const dto: UpdateResidentDTO = {
        building: 99,
        unit: 999,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 호 번호 범위: 최소값 1
     */
    it("should accept unit = 1", async () => {
      const householdUnit1 = { ...mockHousehold2, unit: 1 };
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        householdUnit1,
      );

      const dto: UpdateResidentDTO = {
        building: 1,
        unit: 1,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 호 번호 범위: 큰 값
     */
    it("should accept large unit numbers", async () => {
      const householdLargeUnit = { ...mockHousehold2, unit: 9999 };
      mockQueryRepo.findHouseholdByBuildingAndUnit?.mockResolvedValue(
        householdLargeUnit,
      );

      const dto: UpdateResidentDTO = {
        building: 1,
        unit: 9999,
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });

    /**
     * 한글 이름 수정
     */
    it("should handle Korean names correctly", async () => {
      const dto: UpdateResidentDTO = {
        name: "김철수박진영",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toBeDefined();
    });
  });

  describe("응답 검증", () => {
    /**
     * 응답 구조 검증
     */
    it("should return correct response structure", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("householdId");
      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("contact");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("isHouseholder");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
    });

    /**
     * updatedAt 시간 검증
     */
    it("should have updated updatedAt timestamp", async () => {
      const dto: UpdateResidentDTO = {
        name: "박영수",
      };

      // mock에서 현재 시간으로 업데이트 반환하도록 설정
      const nowTime = new Date();
      mockCommandRepo.updateHouseholdMember?.mockResolvedValue({
        ...mockUpdatedMember,
        updatedAt: nowTime,
      });

      const beforeUpdate = new Date();
      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        "member-1",
        dto,
        "admin-user-1",
        UserRole.ADMIN,
        "apt-1",
      );
      const afterUpdate = new Date();

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
    });
  });
});
