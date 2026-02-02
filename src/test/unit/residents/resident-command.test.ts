import {
  IResidentCommandService,
  ResidentCommandService,
  CreateResidentDTO,
} from "../../../_modules/residents/usecases/resident-command.usecase";
import { IResidentCommandRepo } from "../../../_common/ports/repos/resident/resident-command.repo.interface";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { UserRole } from "../../../_modules/users/domain/user.entity";

describe("ResidentCommandService Unit Test - 입주민 등록", () => {
  let residentService: IResidentCommandService;

  const mockCommandRepo = {
    createHouseholdMember: jest.fn(),
    updateHouseholdMember: jest.fn(),
    createManyHouseholdMembers: jest.fn(),
    deleteHouseholdMember: jest.fn(),
  } as unknown as jest.Mocked<IResidentCommandRepo>;

  const mockQueryRepo = {
    findHouseholdMembers: jest.fn(),
    findHouseholdMemberById: jest.fn(),
    findHouseholdByBuildingAndUnit: jest.fn(),
    findHouseholdMemberByEmail: jest.fn(),
  } as unknown as jest.Mocked<IResidentQueryRepo>;

  beforeAll(() => {
    residentService = ResidentCommandService(mockCommandRepo, mockQueryRepo);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("registerHouseholdMemberByAdmin - 관리자 입주민 등록", () => {
    //  테스트 1: 권한 검증 - ADMIN 역할이 아닌 경우 실패
    describe("권한 검증", () => {
      it("should throw FORBIDDEN when role is not ADMIN", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";
        const invalidRole = UserRole.USER; // USER는 권한이 없음

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            invalidRole,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
          expect((error as BusinessException).type).toBe(
            BusinessExceptionType.FORBIDDEN,
          );
        }
      });

      it("should throw FORBIDDEN when role is SUPER_ADMIN (only ADMIN allowed)", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";
        const invalidRole = UserRole.SUPER_ADMIN; // SUPER_ADMIN도 불가능 (ADMIN만 가능)

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            invalidRole,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
          expect((error as BusinessException).type).toBe(
            BusinessExceptionType.FORBIDDEN,
          );
        }
      });
    });

    //  테스트 2: 입력값 검증
    describe("입력값 검증", () => {
      it("should throw error when building is missing", async () => {
        const dto = {
          building: 0, // 불가능한 값
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        } as CreateResidentDTO;

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
          expect((error as BusinessException).type).toBe(
            BusinessExceptionType.FORBIDDEN,
          );
        }
      });

      it("should throw error when unit is missing", async () => {
        const dto = {
          building: 1,
          unit: 0, // 불가능한 값
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        } as CreateResidentDTO;

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
        }
      });

      it("should throw error when email is missing", async () => {
        const dto = {
          building: 1,
          unit: 101,
          email: "", // 빈 이메일
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        } as CreateResidentDTO;

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
        }
      });

      it("should throw error when contact is missing", async () => {
        const dto = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "", // 빈 연락처
          name: "홍길동",
          isHouseholder: true,
        } as CreateResidentDTO;

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
        }
      });

      it("should throw error when name is missing", async () => {
        const dto = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "", // 빈 이름
          isHouseholder: true,
        } as CreateResidentDTO;

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
        }
      });
    });

    //  테스트 3: Household 존재 여부 검증
    describe("Household 검증", () => {
      it("should throw error when household not found", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        // findHouseholdByBuildingAndUnit이 null 반환
        mockQueryRepo.findHouseholdByBuildingAndUnit.mockResolvedValueOnce(
          null,
        );

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
          expect((error as BusinessException).type).toBe(
            BusinessExceptionType.FORBIDDEN,
          );
        }

        expect(
          mockQueryRepo.findHouseholdByBuildingAndUnit,
        ).toHaveBeenCalledWith(apartmentId, dto.building, dto.unit);
      });
    });

    //  테스트 4: 이메일 중복 검증
    describe("이메일 중복 검증", () => {
      it("should throw error when email already exists", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "duplicate@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";
        const mockHousehold = {
          id: "household-1",
          apartmentId,
          building: dto.building,
          unit: dto.unit,
          createdAt: new Date(),
        };

        // 세대 조회 성공
        mockQueryRepo.findHouseholdByBuildingAndUnit.mockResolvedValueOnce(
          mockHousehold as any,
        );

        // 이메일 중복 존재
        mockQueryRepo.findHouseholdMemberByEmail.mockResolvedValueOnce({
          id: "existing-member-1",
          email: "duplicate@example.com",
        } as any);

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown BusinessException");
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessException);
          expect((error as BusinessException).type).toBe(
            BusinessExceptionType.DUPLICATE_EMAIL,
          );
        }

        expect(mockQueryRepo.findHouseholdMemberByEmail).toHaveBeenCalledWith(
          dto.email,
        );
      });
    });

    //  테스트 5: 성공 케이스
    describe("성공 케이스", () => {
      it("should successfully register household member by admin", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";
        const mockHousehold = {
          id: "household-1",
          apartmentId,
          building: dto.building,
          unit: dto.unit,
          createdAt: new Date(),
        };

        const mockCreatedMember = {
          id: "member-1",
          householdId: mockHousehold.id,
          email: dto.email,
          contact: dto.contact,
          name: dto.name,
          isHouseholder: dto.isHouseholder,
          userId: null,
          userType: "PRE_RESIDENT",
          createdAt: new Date(),
        };

        // Mock 설정
        mockQueryRepo.findHouseholdByBuildingAndUnit.mockResolvedValueOnce(
          mockHousehold as any,
        );
        mockQueryRepo.findHouseholdMemberByEmail.mockResolvedValueOnce(null); // 이메일 중복 없음
        mockCommandRepo.createHouseholdMember.mockResolvedValueOnce(
          mockCreatedMember as any,
        );

        // 실행
        const result = await residentService.registerHouseholdMemberByAdmin(
          dto,
          adminId,
          apartmentId,
          UserRole.ADMIN,
        );

        // 검증
        expect(result.id).toBe("member-1");
        expect(result.email).toBe("resident@example.com");
        expect(result.contact).toBe("01012345678");
        expect(result.name).toBe("홍길동");
        expect(result.isHouseholder).toBe(true);

        expect(
          mockQueryRepo.findHouseholdByBuildingAndUnit,
        ).toHaveBeenCalledWith(apartmentId, dto.building, dto.unit);
        expect(mockQueryRepo.findHouseholdMemberByEmail).toHaveBeenCalledWith(
          dto.email,
        );
        expect(mockCommandRepo.createHouseholdMember).toHaveBeenCalled();
      });

      it("should set isHouseholder default to false when not specified", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident2@example.com",
          contact: "01098765432",
          name: "김철수",
          isHouseholder: false, // 세대주가 아님
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";
        const mockHousehold = {
          id: "household-1",
          apartmentId,
          building: dto.building,
          unit: dto.unit,
          createdAt: new Date(),
        };

        const mockCreatedMember = {
          id: "member-2",
          householdId: mockHousehold.id,
          email: dto.email,
          contact: dto.contact,
          name: dto.name,
          isHouseholder: false,
          userId: null,
          userType: "PRE_RESIDENT",
          createdAt: new Date(),
        };

        mockQueryRepo.findHouseholdByBuildingAndUnit.mockResolvedValueOnce(
          mockHousehold as any,
        );
        mockQueryRepo.findHouseholdMemberByEmail.mockResolvedValueOnce(null);
        mockCommandRepo.createHouseholdMember.mockResolvedValueOnce(
          mockCreatedMember as any,
        );

        const result = await residentService.registerHouseholdMemberByAdmin(
          dto,
          adminId,
          apartmentId,
          UserRole.ADMIN,
        );

        expect(result.isHouseholder).toBe(false);
      });
    });

    //  테스트 6: 에러 처리
    describe("에러 처리", () => {
      it("should wrap technical errors in TechnicalException", async () => {
        const dto: CreateResidentDTO = {
          building: 1,
          unit: 101,
          email: "resident@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        };

        const adminId = "admin-1";
        const apartmentId = "apt-1";

        const mockHousehold = {
          id: "household-1",
          apartmentId,
          building: dto.building,
          unit: dto.unit,
          createdAt: new Date(),
        };

        // DB 오류 발생
        mockQueryRepo.findHouseholdByBuildingAndUnit.mockResolvedValueOnce(
          mockHousehold as any,
        );
        mockQueryRepo.findHouseholdMemberByEmail.mockResolvedValueOnce(null);
        mockCommandRepo.createHouseholdMember.mockRejectedValueOnce(
          new Error("Database connection failed"),
        );

        try {
          await residentService.registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            UserRole.ADMIN,
          );
          fail("Should have thrown TechnicalException");
        } catch (error) {
          expect(error).toBeInstanceOf(TechnicalException);
          expect((error as TechnicalException).type).toBe(
            TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
          );
        }
      });
    });
  });

  describe("registerManyHouseholdMembers - 대량 입주민 등록", () => {
    //  테스트 7: 권한 검증
    it("should throw FORBIDDEN when role is not ADMIN", async () => {
      const dtos: CreateResidentDTO[] = [
        {
          building: 1,
          unit: 101,
          email: "resident1@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        },
      ];

      const adminId = "admin-1";
      const apartmentId = "apt-1";
      const invalidRole = UserRole.USER;

      try {
        await residentService.registerManyHouseholdMembers(
          dtos,
          adminId,
          apartmentId,
          invalidRole,
        );
        fail("Should have thrown BusinessException");
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
        expect((error as BusinessException).type).toBe(
          BusinessExceptionType.FORBIDDEN,
        );
      }
    });

    //  테스트 8: 빈 배열 검증
    it("should throw error when dtos array is empty", async () => {
      const dtos: CreateResidentDTO[] = [];
      const adminId = "admin-1";
      const apartmentId = "apt-1";

      try {
        await residentService.registerManyHouseholdMembers(
          dtos,
          adminId,
          apartmentId,
          UserRole.ADMIN,
        );
        fail("Should have thrown BusinessException");
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
      }
    });

    // 테스트 9: 부분 실패 처리
    it("should continue processing when one member fails and others succeed", async () => {
      const dtos: CreateResidentDTO[] = [
        {
          building: 1,
          unit: 101,
          email: "resident1@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        },
        {
          building: 1,
          unit: 102,
          email: "resident2@example.com",
          contact: "01098765432",
          name: "김철수",
          isHouseholder: false,
        },
      ];

      const adminId = "admin-1";
      const apartmentId = "apt-1";

      const mockHousehold1 = {
        id: "household-1",
        apartmentId,
        building: 1,
        unit: 101,
      };

      const mockHousehold2 = {
        id: "household-2",
        apartmentId,
        building: 1,
        unit: 102,
      };

      // 첫 번째는 성공
      mockQueryRepo.findHouseholdByBuildingAndUnit
        .mockResolvedValueOnce(mockHousehold1 as any)
        .mockResolvedValueOnce(mockHousehold2 as any);

      mockQueryRepo.findHouseholdMemberByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockCommandRepo.createHouseholdMember
        .mockResolvedValueOnce({
          id: "member-1",
          email: dtos[0].email,
        } as any)
        .mockRejectedValueOnce(new Error("Save failed")); // 두 번째는 실패

      const result = await residentService.registerManyHouseholdMembers(
        dtos,
        adminId,
        apartmentId,
        UserRole.ADMIN,
      );

      // 한 명만 등록됨
      expect(result.length).toBe(1);
      expect(result[0].email).toBe(dtos[0].email);
    });

    // 테스트 10: 성공 케이스
    it("should successfully register multiple household members", async () => {
      const dtos: CreateResidentDTO[] = [
        {
          building: 1,
          unit: 101,
          email: "resident1@example.com",
          contact: "01012345678",
          name: "홍길동",
          isHouseholder: true,
        },
        {
          building: 1,
          unit: 102,
          email: "resident2@example.com",
          contact: "01098765432",
          name: "김철수",
          isHouseholder: false,
        },
      ];

      const adminId = "admin-1";
      const apartmentId = "apt-1";

      const mockHousehold1 = {
        id: "household-1",
        apartmentId,
        building: 1,
        unit: 101,
      };

      const mockHousehold2 = {
        id: "household-2",
        apartmentId,
        building: 1,
        unit: 102,
      };

      mockQueryRepo.findHouseholdByBuildingAndUnit
        .mockResolvedValueOnce(mockHousehold1 as any)
        .mockResolvedValueOnce(mockHousehold2 as any);

      mockQueryRepo.findHouseholdMemberByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockCommandRepo.createHouseholdMember
        .mockResolvedValueOnce({
          id: "member-1",
          email: dtos[0].email,
          name: dtos[0].name,
        } as any)
        .mockResolvedValueOnce({
          id: "member-2",
          email: dtos[1].email,
          name: dtos[1].name,
        } as any);

      const result = await residentService.registerManyHouseholdMembers(
        dtos,
        adminId,
        apartmentId,
        UserRole.ADMIN,
      );

      expect(result.length).toBe(2);
      expect(result[0].email).toBe(dtos[0].email);
      expect(result[1].email).toBe(dtos[1].email);
    });
  });
});
