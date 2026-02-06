import { HouseholdEntity } from "../../../_modules/residents/domain/resident.entity";
import { ResidentQueryService } from "../../../_modules/residents/usecases/resident-query.usecase";
import { ResidentCommandService } from "../../../_modules/residents/usecases/resident-command.usecase";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

describe("Resident Model - Integrated Unit Tests", () => {
  describe("HouseholdEntity", () => {
    describe("createHousehold", () => {
      it("✓ 새로운 Household를 생성할 수 있다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });

        expect(household).toHaveProperty("id");
        expect(household.apartmentId).toBe("apt-1");
        expect(household.building).toBe(101);
        expect(household.unit).toBe(101);
        expect(household.householdStatus).toBe("EMPTY");
        expect(household.members).toEqual([]);
        expect(household.version).toBe(1);
      });

      it("✓ 생성된 Household는 고유한 ID를 가진다", () => {
        const household1 = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });
        const household2 = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 102,
          unit: 102,
        });

        expect(household1.id).not.toBe(household2.id);
      });
    });

    describe("activateHousehold", () => {
      it("✓ Household 상태를 ACTIVE로 변경할 수 있다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });

        const activated = HouseholdEntity.activateHousehold(household);

        expect(activated.householdStatus).toBe("ACTIVE");
        expect(activated.updatedAt).not.toEqual(household.createdAt);
      });

      it("✓ 활성화 후에도 기존 데이터는 유지된다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });
        const originalId = household.id;

        const activated = HouseholdEntity.activateHousehold(household);

        expect(activated.id).toBe(originalId);
        expect(activated.apartmentId).toBe("apt-1");
        expect(activated.building).toBe(101);
      });
    });

    describe("moveOutHousehold", () => {
      it("✓ Household 상태를 MOVE_OUT으로 변경할 수 있다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });

        const movedOut = HouseholdEntity.moveOutHousehold(household);

        expect(movedOut.householdStatus).toBe("MOVE_OUT");
      });
    });

    describe("emptyHousehold", () => {
      it("✓ Household 상태를 EMPTY로 변경할 수 있다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });

        const emptied = HouseholdEntity.emptyHousehold(household);

        expect(emptied.householdStatus).toBe("EMPTY");
      });
    });

    describe("restoreHousehold", () => {
      it("✓ 삭제된 Household를 복구할 수 있다", () => {
        const household = HouseholdEntity.createHousehold({
          apartmentId: "apt-1",
          building: 101,
          unit: 101,
        });

        const restored = HouseholdEntity.restoreHousehold(household);

        expect(restored.version).toBeGreaterThan(household.version);
      });
    });
  });
  describe("ResidentQueryService", () => {
    let mockQueryRepo: any;
    let queryService: any;

    beforeEach(() => {
      mockQueryRepo = {
        findHouseholdMembers: jest.fn(),
        findHouseholdMemberDetail: jest.fn(),
        findHouseholdMemberById: jest.fn(),
        findHouseholdByBuildingAndUnit: jest.fn(),
        findHouseholdMemberByEmail: jest.fn(),
      };
      queryService = ResidentQueryService(mockQueryRepo as any);
    });

    describe("getListHouseholdMembers", () => {
      it("✓ 입주민 목록을 조회할 수 있다", async () => {
        const mockMembers = {
          members: [
            {
              id: "member-1",
              name: "홍길동",
              email: "hong@test.com",
              building: 101,
              unit: 101,
              isHouseholder: true,
            },
          ],
          total: 1,
        };

        mockQueryRepo.findHouseholdMembers.mockResolvedValue(mockMembers);

        const result = await queryService.getListHouseholdMembers(
          "apt-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-1",
          "ADMIN",
        );

        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe("홍길동");
        expect(mockQueryRepo.findHouseholdMembers).toHaveBeenCalled();
      });

      it("✓ 페이지와 limit이 올바르게 전달된다", async () => {
        mockQueryRepo.findHouseholdMembers.mockResolvedValue({
          members: [],
          total: 0,
        });

        await queryService.getListHouseholdMembers(
          "apt-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-1",
          "ADMIN",
        );

        const callArgs = mockQueryRepo.findHouseholdMembers.mock.calls[0];
        expect(callArgs[1]).toBe(1);
        expect(callArgs[2]).toBe(20);
      });

      it("✗ 권한이 없으면 FORBIDDEN 에러를 던진다", async () => {
        await expect(
          queryService.getListHouseholdMembers(
            "apt-1",
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
    });

    describe("getHouseholdMemberDetail", () => {
      it("✓ 입주민 상세 정보를 조회할 수 있다", async () => {
        const mockMember = {
          id: "member-1",
          name: "홍길동",
          email: "hong@test.com",
          contact: "010-1234-5678",
          building: 101,
          unit: 101,
          isHouseholder: true,
        };

        mockQueryRepo.findHouseholdMemberDetail.mockResolvedValue(mockMember);

        const result = await queryService.getHouseholdMemberDetail(
          "member-1",
          "admin-1",
          "ADMIN",
        );

        expect(result.id).toBe("member-1");
        expect(result.name).toBe("홍길동");
      });

      it("✗ 권한이 없으면 FORBIDDEN 에러를 던진다", async () => {
        await expect(
          queryService.getHouseholdMemberDetail("member-1", "user-1", "USER"),
        ).rejects.toThrow(BusinessException);
      });
    });
  });

  describe("ResidentCommandService", () => {
    let mockCommandRepo: any;
    let mockQueryRepo: any;
    let commandService: any;

    beforeEach(() => {
      mockQueryRepo = {
        findHouseholdMembers: jest.fn(),
        findHouseholdMemberDetail: jest.fn(),
        findHouseholdMemberById: jest.fn().mockResolvedValue({
          id: "member-1",
          name: "홍길동",
          email: "hong@test.com",
        }),
        findHouseholdByBuildingAndUnit: jest.fn(),
        findHouseholdMemberByEmail: jest.fn(),
      };

      mockCommandRepo = {
        registerHouseholdMemberByAdmin: jest.fn(),
        registerManyHouseholdMembers: jest.fn(),
        registerManyHouseholdMembersFromCsv: jest.fn(),
        updateHouseholdMemberByAdmin: jest.fn(),
        deleteHouseholdMemberByAdmin: jest.fn(),
      };
      commandService = ResidentCommandService(
        mockCommandRepo as any,
        mockQueryRepo as any,
      );
    });

    describe("registerHouseholdMemberByAdmin", () => {
      it("✓ 입주민을 등록할 수 있다", async () => {
        const mockResult = {
          id: "member-1",
          name: "홍길동",
          email: "hong@test.com",
          building: 101,
          unit: 101,
          isHouseholder: true,
        };

        mockCommandRepo.registerHouseholdMemberByAdmin.mockResolvedValue(
          mockResult,
        );

        const result = await commandService.registerHouseholdMemberByAdmin(
          {
            email: "hong@test.com",
            contact: "010-1234-5678",
            name: "홍길동",
            building: 101,
            unit: 101,
            isHouseholder: true,
          },
          "admin-1",
          "apt-1",
          "ADMIN",
        );

        expect(result).toHaveProperty("id");
        expect(result.name).toBe("홍길동");
      });

      it("✓ 필수 필드가 모두 전달되면 등록된다", async () => {
        mockCommandRepo.registerHouseholdMemberByAdmin.mockResolvedValue({
          id: "member-2",
        });

        await commandService.registerHouseholdMemberByAdmin(
          {
            email: "test@test.com",
            contact: "010-5555-5555",
            name: "테스트",
            building: 102,
            unit: 102,
            isHouseholder: true,
          },
          "admin-1",
          "apt-1",
          "ADMIN",
        );

        expect(
          mockCommandRepo.registerHouseholdMemberByAdmin,
        ).toHaveBeenCalled();
      });
    });

    describe("updateHouseholdMemberByAdmin", () => {
      it("✓ 입주민 정보를 수정할 수 있다", async () => {
        const mockResult = {
          id: "member-1",
          name: "홍길동 수정됨",
          contact: "010-9999-9999",
        };

        mockCommandRepo.updateHouseholdMemberByAdmin.mockResolvedValue(
          mockResult,
        );

        const result = await commandService.updateHouseholdMemberByAdmin(
          "member-1",
          {
            name: "홍길동 수정됨",
            contact: "010-9999-9999",
          },
          "admin-1",
          "ADMIN",
        );

        expect(result.name).toBe("홍길동 수정됨");
        expect(result.contact).toBe("010-9999-9999");
      });

      it("✓ 부분 업데이트가 가능하다", async () => {
        mockCommandRepo.updateHouseholdMemberByAdmin.mockResolvedValue({
          id: "member-1",
          name: "업데이트된 이름",
        });

        await commandService.updateHouseholdMemberByAdmin(
          "member-1",
          { name: "업데이트된 이름" },
          "admin-1",
          "ADMIN",
        );

        expect(mockCommandRepo.updateHouseholdMemberByAdmin).toHaveBeenCalled();
      });
    });

    describe("deleteHouseholdMemberByAdmin", () => {
      it("✓ 입주민을 삭제할 수 있다", async () => {
        mockCommandRepo.deleteHouseholdMemberByAdmin.mockResolvedValue(
          undefined,
        );

        await commandService.deleteHouseholdMemberByAdmin(
          "member-1",
          "admin-1",
          "ADMIN",
        );

        expect(
          mockCommandRepo.deleteHouseholdMemberByAdmin,
        ).toHaveBeenCalledWith("member-1", "admin-1", "ADMIN");
      });

      it("✓ 정상적으로 삭제 후 undefined를 반환한다", async () => {
        mockCommandRepo.deleteHouseholdMemberByAdmin.mockResolvedValue(
          undefined,
        );

        const result = await commandService.deleteHouseholdMemberByAdmin(
          "member-1",
          "admin-1",
          "ADMIN",
        );

        expect(result).toBeUndefined();
      });
    });

    describe("registerManyHouseholdMembers", () => {
      it("✓ 여러 입주민을 일괄 등록할 수 있다", async () => {
        mockCommandRepo.registerManyHouseholdMembers.mockResolvedValue([
          { id: "member-1", name: "홍길동" },
          { id: "member-2", name: "김길동" },
        ]);

        const result = await commandService.registerManyHouseholdMembers(
          [
            {
              email: "hong@test.com",
              contact: "010-1111-1111",
              name: "홍길동",
              building: 101,
              unit: 101,
              isHouseholder: true,
            },
            {
              email: "kim@test.com",
              contact: "010-2222-2222",
              name: "김길동",
              building: 101,
              unit: 101,
              isHouseholder: false,
            },
          ],
          "admin-1",
          "apt-1",
          "ADMIN",
        );

        expect(result).toHaveLength(2);
      });
    });

    describe("registerManyHouseholdMembersFromCsv", () => {
      it("✓ CSV 파일에서 입주민을 일괄 등록할 수 있다", async () => {
        mockCommandRepo.registerManyHouseholdMembersFromCsv.mockResolvedValue(
          2,
        );

        const result = await commandService.registerManyHouseholdMembersFromCsv(
          Buffer.from("email,name\nhong@test.com,홍길동\nkim@test.com,김길동"),
          "admin-1",
          "apt-1",
          "ADMIN",
        );

        expect(result).toBe(2);
      });
    });
  });

  describe("Integrated Scenarios", () => {
    it("✓ 전체 흐름: 세대 생성 → 입주민 등록 → 입주민 조회 → 입주민 수정 → 입주민 삭제", async () => {
      const household = HouseholdEntity.createHousehold({
        apartmentId: "apt-1",
        building: 101,
        unit: 101,
      });
      expect(household.householdStatus).toBe("EMPTY");

      const activated = HouseholdEntity.activateHousehold(household);
      expect(activated.householdStatus).toBe("ACTIVE");

      const mockQueryRepo = {
        findHouseholdMembers: jest.fn().mockResolvedValue({
          members: [
            {
              id: "member-1",
              name: "홍길동",
              email: "hong@test.com",
              building: 101,
              unit: 101,
              isHouseholder: true,
            },
          ],
          total: 1,
        }),
        findHouseholdMemberDetail: jest.fn().mockResolvedValue({
          id: "member-1",
          name: "홍길동",
          email: "hong@test.com",
        }),
        findHouseholdMemberById: jest.fn().mockResolvedValue({
          id: "member-1",
        }),
        findHouseholdByBuildingAndUnit: jest.fn(),
        findHouseholdMemberByEmail: jest.fn(),
      };

      const mockCommandRepo = {
        registerHouseholdMemberByAdmin: jest.fn().mockResolvedValue({
          id: "member-1",
          name: "홍길동",
          email: "hong@test.com",
          building: 101,
          unit: 101,
          isHouseholder: true,
        }),
        updateHouseholdMemberByAdmin: jest.fn().mockResolvedValue({
          id: "member-1",
          name: "홍길동 수정됨",
        }),
        deleteHouseholdMemberByAdmin: jest.fn().mockResolvedValue(undefined),
        registerManyHouseholdMembers: jest.fn(),
        registerManyHouseholdMembersFromCsv: jest.fn(),
      };

      const queryService = ResidentQueryService(mockQueryRepo as any);
      const commandService = ResidentCommandService(
        mockCommandRepo as any,
        mockQueryRepo as any,
      );

      const registered = await commandService.registerHouseholdMemberByAdmin(
        {
          email: "hong@test.com",
          contact: "010-1234-5678",
          name: "홍길동",
          building: 101,
          unit: 101,
          isHouseholder: true,
        },
        "admin-1",
        "apt-1",
        "ADMIN",
      );
      expect(registered.name).toBe("홍길동");

      const members = await queryService.getListHouseholdMembers(
        "apt-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-1",
        "ADMIN",
      );
      expect(members.data).toHaveLength(1);
      expect(members.data[0].name).toBe("홍길동");

      const detail = await queryService.getHouseholdMemberDetail(
        "member-1",
        "admin-1",
        "ADMIN",
      );
      expect(detail.id).toBe("member-1");

      const updated = await commandService.updateHouseholdMemberByAdmin(
        "member-1",
        { name: "홍길동 수정됨" },
        "admin-1",
        "ADMIN",
      );
      expect(updated.name).toBe("홍길동 수정됨");

      await commandService.deleteHouseholdMemberByAdmin(
        "member-1",
        "admin-1",
        "ADMIN",
      );
      expect(mockCommandRepo.deleteHouseholdMemberByAdmin).toHaveBeenCalledWith(
        "member-1",
        "admin-1",
        "ADMIN",
      );
    });

    it("✓ 권한 검증 시나리오: 관리자만 조회/수정/삭제 가능", async () => {
      const mockQueryRepo = {
        findHouseholdMembers: jest.fn(),
        findHouseholdMemberDetail: jest.fn(),
        findHouseholdMemberById: jest.fn(),
        findHouseholdByBuildingAndUnit: jest.fn(),
        findHouseholdMemberByEmail: jest.fn(),
      };
      const queryService = ResidentQueryService(mockQueryRepo as any);

      mockQueryRepo.findHouseholdMembers.mockResolvedValue({
        members: [],
        total: 0,
      });
      await expect(
        queryService.getListHouseholdMembers(
          "apt-1",
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "admin-1",
          "ADMIN",
        ),
      ).resolves.toBeDefined();

      await expect(
        queryService.getListHouseholdMembers(
          "apt-1",
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
  });

  describe("Validation & Edge Cases", () => {
    let mockQueryRepo: any;
    let queryService: any;

    beforeEach(() => {
      mockQueryRepo = {
        findHouseholdMembers: jest.fn(),
        findHouseholdMemberDetail: jest.fn(),
        findHouseholdMemberById: jest.fn(),
        findHouseholdByBuildingAndUnit: jest.fn(),
        findHouseholdMemberByEmail: jest.fn(),
      };
      queryService = ResidentQueryService(mockQueryRepo as any);
    });

    it("✓ 빈 목록을 반환할 수 있다", async () => {
      mockQueryRepo.findHouseholdMembers.mockResolvedValue({
        members: [],
        total: 0,
      });

      const result = await queryService.getListHouseholdMembers(
        "apt-1",
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-1",
        "ADMIN",
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("✓ 대량의 입주민을 조회할 수 있다", async () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `member-${i}`,
        name: `입주민${i}`,
        email: `resident${i}@test.com`,
      }));

      mockQueryRepo.findHouseholdMembers.mockResolvedValue({
        members: largeList,
        total: 100,
      });

      const result = await queryService.getListHouseholdMembers(
        "apt-1",
        1,
        100,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "admin-1",
        "ADMIN",
      );

      expect(result.data).toHaveLength(100);
      expect(result.total).toBe(100);
    });

    it("✓ HouseholdEntity는 불변성을 유지한다", () => {
      const household = HouseholdEntity.createHousehold({
        apartmentId: "apt-1",
        building: 101,
        unit: 101,
      });

      const originalId = household.id;
      const activated = HouseholdEntity.activateHousehold(household);

      expect(household.householdStatus).toBe("EMPTY");
      expect(activated.householdStatus).toBe("ACTIVE");
      expect(activated.id).toBe(originalId);
    });

    it("✓ Entity 생성 시 기본값이 올바르게 설정된다", () => {
      const household = HouseholdEntity.createHousehold({
        apartmentId: "apt-1",
        building: 101,
        unit: 101,
      });

      expect(household.createdAt).toBeInstanceOf(Date);
      expect(household.updatedAt).toBeInstanceOf(Date);
      expect(household.version).toBe(1);
    });
  });
});
