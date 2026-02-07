import { ResidentQueryService } from "../../../_modules/residents/usecases/resident-query.usecase";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { HouseholdMemberWithRelations } from "../../../_modules/residents/domain/resident.type";

describe("ResidentQueryService - Unit Tests", () => {
  let residentQueryService: ReturnType<typeof ResidentQueryService>;
  let mockRepository: jest.Mocked<IResidentQueryRepo>;

  const mockHouseholdMember: HouseholdMemberWithRelations = {
    id: "member-1",
    householdId: "household-1",
    userId: "user-1",
    userType: "RESIDENT",
    isHouseholder: true,
    email: "test@example.com",
    contact: "010-1234-5678",
    name: "홍길동",
    movedInAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    user: {
      id: "user-1",
      email: "test@example.com",
      contact: "010-1234-5678",
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

  const mockHouseholdMember2: HouseholdMemberWithRelations = {
    id: "member-2",
    householdId: "household-2",
    userId: "user-2",
    userType: "RESIDENT",
    isHouseholder: false,
    email: "test2@example.com",
    contact: "010-2222-2222",
    name: "김영희",
    movedInAt: new Date("2026-01-05"),
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
    user: {
      id: "user-2",
      email: "test2@example.com",
      contact: "010-2222-2222",
      name: "김영희",
    },
    household: {
      id: "household-2",
      building: 2,
      unit: 202,
      apartmentId: "apt-1",
      apartment: {
        id: "apt-1",
        name: "테스트 아파트",
        address: "서울시 강남구",
      },
    },
  };

  beforeEach(() => {
    mockRepository = {
      findHouseholdMembers: jest.fn(),
      findHouseholdMemberById: jest.fn(),
      findHouseholdByBuildingAndUnit: jest.fn(),
      findHouseholdMemberByEmail: jest.fn(),
    } as unknown as jest.Mocked<IResidentQueryRepo>;

    residentQueryService = ResidentQueryService(mockRepository);
  });

  describe("GET /api/v2/residents - 입주민 목록 조회", () => {
    it("should return list of household members with pagination", async () => {
      const mockResponse = {
        members: [mockHouseholdMember, mockHouseholdMember2],
        total: 2,
      };
      mockRepository.findHouseholdMembers.mockResolvedValue(mockResponse);

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: "member-1",
            email: "test@example.com",
            name: "홍길동",
            building: 1,
            unit: 101,
          }),
          expect.objectContaining({
            id: "member-2",
            email: "test2@example.com",
            name: "김영희",
            building: 2,
            unit: 202,
          }),
        ]),
        total: 2,
        page: 1,
        limit: 20,
        hasNext: false,
      });

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        {
          building: undefined,
          unit: undefined,
          searchKeyword: undefined,
          isHouseholder: undefined,
          isRegistered: undefined,
        },
      );
    });

    it("should handle pagination with page parameter", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 50,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        2,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.page).toBe(2);
      expect(result.hasNext).toBe(true);
    });

    it("should respect limit parameter", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 100,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        5,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.limit).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        5,
        expect.any(Object),
      );
    });

    it("should filter by searchKeyword (name, email, contact)", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        "홍길동",
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          searchKeyword: "홍길동",
        }),
      );
    });

    it("should filter by building (1~99)", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          building: 1,
        }),
      );
    });

    it("should filter by unit", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        1,
        101,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          building: 1,
          unit: 101,
        }),
      );
    });

    it("should filter by isHouseholder flag", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          isHouseholder: true,
        }),
      );
    });

    it("should filter by isRegistered flag", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          isRegistered: true,
        }),
      );
    });

    it("should apply multiple filters together", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        1,
        101,
        "홍길동",
        true,
        true,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        {
          building: 1,
          unit: 101,
          searchKeyword: "홍길동",
          isHouseholder: true,
          isRegistered: true,
        },
      );
    });

    it("should return empty list when no members found", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [],
        total: 0,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });

    it("should cap limit to 100 maximum", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        200,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        100,
        expect.any(Object),
      );
    });

    it("should throw error when page is less than 1", async () => {
      await expect(
        residentQueryService.getListHouseholdMembers(
          "apartment-1",
          0,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-user-1",
          "ADMIN",
        ),
      ).rejects.toThrow("page must be >= 1");
    });

    it("should throw error when limit is less than 1", async () => {
      await expect(
        residentQueryService.getListHouseholdMembers(
          "apartment-1",
          1,
          0,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-user-1",
          "ADMIN",
        ),
      ).rejects.toThrow("limit must be >= 1");
    });

    it("should throw FORBIDDEN when user is not ADMIN", async () => {
      await expect(
        residentQueryService.getListHouseholdMembers(
          "apartment-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "user-1",
          "USER",
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN when userId is missing", async () => {
      await expect(
        residentQueryService.getListHouseholdMembers(
          "apartment-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "",
          "ADMIN",
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN when role is missing", async () => {
      await expect(
        residentQueryService.getListHouseholdMembers(
          "apartment-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-user-1",
          "", // empty role
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should return correct response structure", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("hasNext");

      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("createdAt");
      expect(result.data[0]).toHaveProperty("email");
      expect(result.data[0]).toHaveProperty("contact");
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("building");
      expect(result.data[0]).toHaveProperty("unit");
      expect(result.data[0]).toHaveProperty("isHouseholder");
      expect(result.data[0]).toHaveProperty("userId");
    });
  });

  describe("GET /api/v2/residents/{id} - 입주민 상세 조회", () => {
    it("should return household member detail by id", async () => {
      mockRepository.findHouseholdMemberById.mockResolvedValue(
        mockHouseholdMember,
      );

      const result = await residentQueryService.getHouseholdMemberDetail(
        "member-1",
        "admin-user-1",
        "ADMIN",
      );

      expect(result).toEqual({
        id: "member-1",
        email: "test@example.com",
        contact: "010-1234-5678",
        name: "홍길동",
        building: 1,
        unit: 101,
        isHouseholder: true,
        userId: "user-1",
        createdAt: mockHouseholdMember.createdAt.toISOString(),
        apartment: {
          id: "apt-1",
          name: "테스트 아파트",
          address: "서울시 강남구",
        },
      });

      expect(mockRepository.findHouseholdMemberById).toHaveBeenCalledWith(
        "member-1",
      );
    });

    it("should return createdAt in ISO format", async () => {
      mockRepository.findHouseholdMemberById.mockResolvedValue(
        mockHouseholdMember,
      );

      const result = await residentQueryService.getHouseholdMemberDetail(
        "member-1",
        "admin-user-1",
        "ADMIN",
      );

      expect(typeof result.createdAt).toBe("string");
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
    });

    it("should return correct response structure", async () => {
      mockRepository.findHouseholdMemberById.mockResolvedValue(
        mockHouseholdMember,
      );

      const result = await residentQueryService.getHouseholdMemberDetail(
        "member-1",
        "admin-user-1",
        "ADMIN",
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("contact");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("building");
      expect(result).toHaveProperty("unit");
      expect(result).toHaveProperty("isHouseholder");
      expect(result).toHaveProperty("userId");
    });

    it("should throw NOT_FOUND when member does not exist", async () => {
      mockRepository.findHouseholdMemberById.mockResolvedValue(null);

      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "non-existent-id",
          "admin-user-1",
          "ADMIN",
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw error when id is empty", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "",
          "admin-user-1",
          "ADMIN",
        ),
      ).rejects.toThrow("householdMemberId is required");
    });

    it("should throw error when id is only whitespace", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "   ",
          "admin-user-1",
          "ADMIN",
        ),
      ).rejects.toThrow("householdMemberId is required");
    });

    it("should throw FORBIDDEN when user is not ADMIN", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "member-1",
          "user-1",
          "USER", // not ADMIN
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN when userId is missing", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "member-1",
          "", // empty userId
          "ADMIN",
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN when role is missing", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "member-1",
          "admin-user-1",
          "", // empty role
        ),
      ).rejects.toThrow(BusinessException);
    });

    it("should throw FORBIDDEN for non-ADMIN roles", async () => {
      await expect(
        residentQueryService.getHouseholdMemberDetail(
          "member-1",
          "super-admin-1",
          "SUPER_ADMIN",
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("Edge Cases & Integration", () => {
    it("should handle page boundaries correctly", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 105, // 105 items, limit 20 = 5.25 pages (ceil = 6 pages)
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        6, // page 6 (last page)
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.page).toBe(6);
      expect(result.hasNext).toBe(false); // last page
    });

    it("should handle very large page numbers", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [],
        total: 20,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        9999,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.page).toBe(9999);
      expect(result.hasNext).toBe(false);
    });

    it("should work with limit = 1", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 100,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.limit).toBe(1);
      expect(result.hasNext).toBe(true);
    });

    it("should return correct building numbers (1~99)", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember, mockHouseholdMember2],
        total: 2,
      });

      const result = await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(result.data[0].building).toBe(1);
      expect(result.data[1].building).toBe(2);
    });

    it("should handle Korean search keyword", async () => {
      mockRepository.findHouseholdMembers.mockResolvedValue({
        members: [mockHouseholdMember],
        total: 1,
      });

      await residentQueryService.getListHouseholdMembers(
        "apartment-1",
        1,
        20,
        undefined,
        undefined,
        "테스트", // Korean keyword
        undefined,
        undefined,
        "admin-user-1",
        "ADMIN",
      );

      expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
        "apartment-1",
        1,
        20,
        expect.objectContaining({
          searchKeyword: "테스트",
        }),
      );
    });
  });
});
