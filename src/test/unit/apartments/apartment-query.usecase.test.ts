import { ApartmentQueryUsecase } from "../../../_modules/apartments/usecases/query/apartment-query.usecase";
import { ApartmentMapper } from "../../../_infra/mappers/apartment.mapper";
import { Apartment as ApartmentPrisma } from "@prisma/client";

describe("ApartmentQueryUsecase", () => {
  let usecase: ReturnType<typeof ApartmentQueryUsecase>;

  // Mock Repository
  const mockApartmentQueryRepo = {
    findApartmentList: jest.fn(),
    findApartmentDetailById: jest.fn(),
    findApartmentByName: jest.fn(),
    findApartmentByAddress: jest.fn(),
    findApartmentByDescription: jest.fn(),
    findApartmentByOfficeNumber: jest.fn(),
  };

  // 테스트용 아파트 데이터
  const mockApartmentData: ApartmentPrisma = {
    id: "apt-001",
    name: "시큐리티팀 아파트",
    address: "서울시 강남구 테헤란로",
    description: "고급 주택형 아파트",
    officeNumber: "02-1234-5678",
    adminId: null,
    buildingNumberFrom: 1,
    buildingNumberTo: 3, // 3개 건물 (1~3번 건물)
    floorCountPerBuilding: 4, // 4층
    unitCountPerFloor: 3, // 층당 3호
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = ApartmentQueryUsecase(mockApartmentQueryRepo as any);
  });

  // ============================================================================
  // ApartmentMapper 테스트
  // ============================================================================

  describe("ApartmentMapper.toDomain", () => {
    it("Prisma 모델을 Domain 엔티티로 변환해야 한다", () => {
      // Act
      const result = ApartmentMapper.toDomain(mockApartmentData);

      // Assert
      expect(result.id).toBe("apt-001");
      expect(result.name).toBe("시큐리티팀 아파트");
      expect(result.address).toBe("서울시 강남구 테헤란로");
      expect(result.buildingNumberFrom).toBe(1);
      expect(result.buildingNumberTo).toBe(3);
    });

    it("null adminId를 null로 유지해야 한다", () => {
      // Act
      const result = ApartmentMapper.toDomain(mockApartmentData);

      // Assert
      expect(result.adminId).toBeNull();
    });
  });

  describe("ApartmentMapper.toPersistenceCreate", () => {
    it("새로운 아파트 생성용 데이터로 변환해야 한다", () => {
      // Arrange
      const entity = ApartmentMapper.toDomain(mockApartmentData);

      // Act
      const result = ApartmentMapper.toPersistenceCreate(entity);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe("시큐리티팀 아파트");
      expect(result.address).toBe("서울시 강남구 테헤란로");
      expect(result.buildingNumberFrom).toBe(1);
      expect(result.buildingNumberTo).toBe(3);
    });

    it("id가 없으면 새로운 id를 생성해야 한다", () => {
      // Arrange
      const entity = ApartmentMapper.toDomain(mockApartmentData);
      entity.id = undefined as any;

      // Act
      const result = ApartmentMapper.toPersistenceCreate(entity);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.id).not.toBe(mockApartmentData.id);
    });
  });

  describe("ApartmentMapper.toPersistenceUpdate", () => {
    it("업데이트용 데이터로 변환해야 한다", () => {
      // Arrange
      const entity = ApartmentMapper.toDomain(mockApartmentData);

      // Act
      const result = ApartmentMapper.toPersistenceUpdate(entity);

      // Assert
      expect(result.name).toBe("시큐리티팀 아파트");
      expect(result.buildingNumberTo).toBe(3);
      // id는 포함되지 않아야 함
      expect((result as any).id).toBeUndefined();
    });
  });

  describe("ApartmentMapper.toHouseholdList", () => {
    it("올바른 개수의 household를 생성해야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      // 3 건물 × 4 층 × 3 호 = 36개
      expect(households.length).toBe(36);
    });

    it("household unit이 101, 102등의  형식이어야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      households.forEach((household) => {
        const floor = Math.floor(household.unit / 100);
        const sequence = household.unit % 100;

        expect(floor).toBeGreaterThanOrEqual(1);
        expect(floor).toBeLessThanOrEqual(4);
        expect(sequence).toBeGreaterThanOrEqual(1);
        expect(sequence).toBeLessThanOrEqual(3);
      });
    });

    it("첫 번째 household는 건물 1, 1층 1호여야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      expect(households[0]).toEqual({
        building: 1,
        unit: 101,
        floor: 1,
        sequence: 1,
        displayName: "1동 1층 1호",
      });
    });

    it("마지막 household는 건물 3, 4층 3호여야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      expect(households[households.length - 1]).toEqual({
        building: 3,
        unit: 403,
        floor: 4,
        sequence: 3,
        displayName: "3동 4층 3호",
      });
    });

    it("건물별로 그룹화되어야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      const buildingGroups = new Map<number, number>();
      households.forEach((h) => {
        const count = buildingGroups.get(h.building) || 0;
        buildingGroups.set(h.building, count + 1);
      });

      // 각 건물당 12개씩 (4층 × 3호)
      expect(buildingGroups.size).toBe(3);
      buildingGroups.forEach((count) => {
        expect(count).toBe(12);
      });
    });

    it("다양한 아파트 구성에 대해 올바르게 계산해야 한다", () => {
      // Arrange
      const testCases = [
        {
          data: {
            ...mockApartmentData,
            buildingNumberTo: 2,
            floorCountPerBuilding: 3,
            unitCountPerFloor: 2,
          },
          expected: 12,
        },
        {
          data: {
            ...mockApartmentData,
            buildingNumberTo: 5,
            floorCountPerBuilding: 2,
            unitCountPerFloor: 4,
          },
          expected: 40,
        },
        {
          data: {
            ...mockApartmentData,
            buildingNumberTo: 1,
            floorCountPerBuilding: 1,
            unitCountPerFloor: 1,
          },
          expected: 1,
        },
      ];

      testCases.forEach(({ data, expected }) => {
        // Act
        const households = ApartmentMapper.toHouseholdList(data as any);

        // Assert
        expect(households.length).toBe(expected);
      });
    });

    it("displayName이 올바른 형식이어야 한다", () => {
      // Act
      const households = ApartmentMapper.toHouseholdList(mockApartmentData);

      // Assert
      const sample = households.find((h) => h.building === 2 && h.unit === 203);
      expect(sample?.displayName).toBe("2동 2층 3호");
    });
  });

  describe("ApartmentMapper.toListPresentation", () => {
    it("아파트 목록을 프레젠테이션 형식으로 변환해야 한다", () => {
      // Arrange
      const apartments: any[] = [
        {
          ...mockApartmentData,
          household: [
            { building: 1, unit: 101 },
            { building: 1, unit: 201 },
            { building: 2, unit: 101 },
          ],
        },
      ];

      // Act
      const result = ApartmentMapper.toListPresentation(apartments, 1, 1, 10);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.hasNext).toBe(false);
    });

    it("동 번호를 클라이언트 형식으로 변환해야 한다", () => {
      // Arrange
      const apartments: any[] = [
        {
          ...mockApartmentData,
          household: [
            { building: 1, unit: 101 },
            { building: 2, unit: 201 },
          ],
        },
      ];

      // Act
      const result = ApartmentMapper.toListPresentation(apartments, 1, 1, 10);

      // Assert
      expect(result.data[0].buildings).toEqual([1, 2]);
    });

    it("페이징 정보를 올바르게 계산해야 한다", () => {
      // Arrange
      const apartments: any[] = [
        {
          ...mockApartmentData,
          household: [{ building: 1, unit: 101 }],
        },
      ];

      // Act
      const result = ApartmentMapper.toListPresentation(apartments, 25, 1, 10);

      // Assert
      expect(result.hasNext).toBe(true); // 1 * 10 < 25
    });
  });

  describe("ApartmentMapper.toDetailPresentation", () => {
    it("아파트 상세 정보를 변환해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [
          { building: 1, unit: 101 },
          { building: 1, unit: 201 },
          { building: 2, unit: 101 },
        ],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.totalUnits).toBe(3);
      expect(result.buildingCount).toBe(2);
      expect(result.buildings).toEqual([1, 2]);
      expect(result.units).toContain(101);
      expect(result.units).toContain(201);
    });

    it("건물 당 세대 수를 올바르게 계산해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [
          { building: 1, unit: 101 },
          { building: 1, unit: 201 },
          { building: 1, unit: 301 },
          { building: 2, unit: 101 },
          { building: 2, unit: 201 },
        ],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      // 5개 세대 / 2개 건물 = 2.5
      expect(result.householdCountPerBuilding).toBe(2.5);
    });

    it("빈 household 배열을 처리해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.totalUnits).toBe(0);
      expect(result.buildingCount).toBe(0);
      expect(result.householdCountPerBuilding).toBe(0);
    });
  });

  describe("ApartmentMapper.toDetailPresentationArray", () => {
    it("여러 아파트를 상세 정보로 변환해야 한다", () => {
      // Arrange
      const apartments: any[] = [
        {
          ...mockApartmentData,
          id: "apt-001",
          household: [{ building: 1, unit: 101 }],
        },
        {
          ...mockApartmentData,
          id: "apt-002",
          household: [{ building: 2, unit: 201 }],
        },
      ];

      // Act
      const results = ApartmentMapper.toDetailPresentationArray(apartments);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe("apt-001");
      expect(results[1].id).toBe("apt-002");
    });
  });

  describe("Building Number Transformation", () => {
    it("DB 동 번호 1을 그대로 반환해야 한다 (변환 안 함)", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [{ building: 1, unit: 101 }],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.buildings).toContain(1);
      expect(result.buildings).not.toContain(101);
    });

    it("DB 동 번호 2를 그대로 반환해야 한다 (변환 안 함)", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [{ building: 2, unit: 101 }],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.buildings).toContain(2);
      expect(result.buildings).not.toContain(102);
    });

    it("여러 동 번호를 그대로 반환해야 한다 (변환 안 함)", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [
          { building: 1, unit: 101 },
          { building: 2, unit: 101 },
          { building: 3, unit: 101 },
        ],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.buildings).toEqual([1, 2, 3]);
    });
  });

  describe("Edge Cases", () => {
    it("null household을 처리해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: null,
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.totalUnits).toBe(0);
      expect(result.buildings).toEqual([]);
    });

    it("중복 동 번호를 제거해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [
          { building: 1, unit: 101 },
          { building: 1, unit: 201 },
          { building: 1, unit: 301 },
        ],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.buildings).toEqual([1]);
      expect(result.buildingCount).toBe(1);
    });

    it("호수를 오름차순으로 정렬해야 한다", () => {
      // Arrange
      const apartment: any = {
        ...mockApartmentData,
        household: [
          { building: 1, unit: 303 },
          { building: 1, unit: 101 },
          { building: 1, unit: 202 },
        ],
      };

      // Act
      const result = ApartmentMapper.toDetailPresentation(apartment);

      // Assert
      expect(result.units).toEqual([101, 202, 303]);
    });
  });
});
