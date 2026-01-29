// import { ResidentQueryService } from "../../../_modules/residents/usecases/resident-query.usecase";
// import { IResidentQueryRepo } from "../../../_modules/residents/domain/resident-query.repo.interface";
// import {
//   BusinessException,
//   BusinessExceptionType,
// } from "../../../_common/exceptions/business.exception";
// import { HouseholdMemberWithRelations } from "../../../_modules/residents/domain/resident.type";

// /**
//  * ResidentQueryService 유닛 테스트
//  *
//  * 테스트:
//  * 1. 입주민 목록 조회 - 성공 케이스
//  * 2. 입주민 목록 조회 - 권한 검증
//  * 3. 입주민 목록 조회 - 입력값 검증
//  * 4. 입주민 상세 조회 - 성공 케이스
//  * 5. 입주민 상세 조회 - 존재하지 않는 경우
//  * 6. 입주민 상세 조회 - 권한 검증
//  */

// describe("ResidentQueryService - Unit Tests", () => {
//   let residentQueryService: ReturnType<typeof ResidentQueryService>;
//   let mockRepository: jest.Mocked<IResidentQueryRepo>;

//   const mockHouseholdMember: HouseholdMemberWithRelations = {
//     id: "member-1",
//     householdId: "household-1",
//     userId: "user-1",
//     isHouseholder: true,
//     householdMemberStatus: "ACTIVE",
//     movedInAt: new Date("2026-01-01"),
//     createdAt: new Date("2026-01-01"),
//     updatedAt: new Date("2026-01-01"),
//     user: {
//       id: "user-1",
//       email: "test@example.com",
//       contact: "010-1234-5678",
//       name: "홍길동",
//     },
//     household: {
//       id: "household-1",
//       building: 1,
//       unit: 101,
//     },
//   };

//   const mockHouseholdMember2: HouseholdMemberWithRelations = {
//     id: "member-2",
//     householdId: "household-2",
//     userId: "user-2",
//     isHouseholder: false,
//     householdMemberStatus: "ACTIVE",
//     movedInAt: new Date("2026-01-05"),
//     createdAt: new Date("2026-01-05"),
//     updatedAt: new Date("2026-01-05"),
//     user: {
//       id: "user-2",
//       email: "test2@example.com",
//       contact: "010-2222-2222",
//       name: "김영희",
//     },
//     household: {
//       id: "household-2",
//       building: 2,
//       unit: 202,
//     },
//   };

//   beforeEach(() => {
//     mockRepository = {
//       findHouseholdMembers: jest.fn(),
//       findHouseholdMemberById: jest.fn(),
//     };

//     residentQueryService = ResidentQueryService(mockRepository);
//   });

//   describe("getListHouseholdMembers - 입주민 목록 조회", () => {
//     /**
//      * 성공: 정상적인 입주민 목록 조회
//      */
//     it("should return list of household members with pagination", async () => {
//       const mockResponse = {
//         members: [mockHouseholdMember, mockHouseholdMember2],
//         total: 2,
//       };
//       mockRepository.findHouseholdMembers.mockResolvedValue(mockResponse);

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result).toEqual({
//         data: expect.arrayContaining([
//           expect.objectContaining({
//             id: "member-1",
//             email: "test@example.com",
//             name: "홍길동",
//             building: 1,
//             unit: 101,
//           }),
//           expect.objectContaining({
//             id: "member-2",
//             email: "test2@example.com",
//             name: "김영희",
//             building: 2,
//             unit: 202,
//           }),
//         ]),
//         total: 2,
//         page: 1,
//         limit: 20,
//         hasNext: false,
//       });

//       expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
//         "apartment-1",
//         1,
//         20,
//       );
//     });

//     /**
//      * 성공: 페이지네이션 - 다음 페이지 있음
//      */
//     it("should calculate hasNext correctly", async () => {
//       const mockResponse = {
//         members: [mockHouseholdMember],
//         total: 25, // 25개 데이터, limit 20 → hasNext true
//       };
//       mockRepository.findHouseholdMembers.mockResolvedValue(mockResponse);

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.hasNext).toBe(true);
//       expect(result.page).toBe(1);
//       expect(result.limit).toBe(20);
//     });

//     /**
//      * 성공: 페이지네이션 - 마지막 페이지
//      */
//     it("should return hasNext false on last page", async () => {
//       const mockResponse = {
//         members: [mockHouseholdMember],
//         total: 20,
//       };
//       mockRepository.findHouseholdMembers.mockResolvedValue(mockResponse);

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.hasNext).toBe(false);
//     });

//     /**
//      * 성공 : 빈 목록 반환
//      */
//     it("should return empty list when no members found", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [],
//         total: 0,
//       });

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.data).toEqual([]);
//       expect(result.total).toBe(0);
//       expect(result.hasNext).toBe(false);
//     });

//     /**
//      * 실패 : apartmentId 없음
//      */
//     it("should throw error when apartmentId is empty", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "", // empty apartmentId
//           1,
//           20,
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("apartmentId is required");
//     });

//     /**
//      * 실패 : page < 1
//      */
//     it("should throw error when page is less than 1", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           0, // invalid page
//           20,
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("page must be >= 1");
//     });

//     /**
//      * 실패 : limit < 1
//      */
//     it("should throw error when limit is less than 1", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           1,
//           0, // invalid limit
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("limit must be >= 1");
//     });

//     /**
//      * 실패 : userId 없음 (인증 실패)
//      */
//     it("should throw FORBIDDEN when userId is missing", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           1,
//           20,
//           "", // empty userId
//           "ADMIN",
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 실패 : role 없음 (인증 실패)
//      */
//     it("should throw FORBIDDEN when role is missing", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           1,
//           20,
//           "admin-user-1",
//           "", // empty role
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 실패: 권한이 ADMIN이 아님 (USER 역할)
//      */
//     it("should throw FORBIDDEN when user is not ADMIN", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           1,
//           20,
//           "user-1",
//           "USER", // not ADMIN
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 성공: limit 자동 조정 (limit > 100 → 100으로 조정)
//      */
//     it("should cap limit to 100 maximum", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [mockHouseholdMember],
//         total: 1,
//       });

//       await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         200, // limit > 100
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
//         "apartment-1",
//         1,
//         100, // capped to 100
//       );
//     });

//     /**
//      * 실패 : page < 1 (음수 페이지)
//      */
//     it("should set page to 1 when page is less than 1", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "apartment-1",
//           -5, // negative page
//           20,
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("page must be >= 1");
//     });
//   });

//   // getHouseholdMemberDetail 테스트

//   describe("getHouseholdMemberDetail - 입주민 상세 조회", () => {
//     /**
//      * 성공 : 입주민 상세 조회
//      */
//     it("should return household member detail", async () => {
//       mockRepository.findHouseholdMemberById.mockResolvedValue(
//         mockHouseholdMember,
//       );

//       const result = await residentQueryService.getHouseholdMemberDetail(
//         "member-1",
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result).toEqual({
//         id: "member-1",
//         email: "test@example.com",
//         contact: "010-1234-5678",
//         name: "홍길동",
//         building: 1,
//         unit: 101,
//         isHouseholder: true,
//         userId: "user-1",
//         createdAt: mockHouseholdMember.createdAt.toISOString(),
//       });

//       expect(mockRepository.findHouseholdMemberById).toHaveBeenCalledWith(
//         "member-1",
//       );
//     });

//     /**
//      * 성공 : createdAt 포맷 검증
//      */
//     it("should format createdAt as ISO string", async () => {
//       mockRepository.findHouseholdMemberById.mockResolvedValue(
//         mockHouseholdMember,
//       );

//       const result = await residentQueryService.getHouseholdMemberDetail(
//         "member-1",
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.createdAt).toBe(
//         mockHouseholdMember.createdAt.toISOString(),
//       );
//       expect(typeof result.createdAt).toBe("string");
//       expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
//     });

//     /**
//      * 실패 : householdMemberId 없음
//      */
//     it("should throw error when householdMemberId is empty", async () => {
//       await expect(
//         residentQueryService.getHouseholdMemberDetail(
//           "", // empty householdMemberId
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("householdMemberId is required");
//     });

//     /**
//      * 실패 : 존재하지 않는 입주민 (404)
//      */
//     it("should throw NOT_FOUND when member does not exist", async () => {
//       mockRepository.findHouseholdMemberById.mockResolvedValue(null);

//       await expect(
//         residentQueryService.getHouseholdMemberDetail(
//           "non-existent-id",
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 실패 : userId 없음 (인증 실패)
//      */
//     it("should throw FORBIDDEN when userId is missing", async () => {
//       await expect(
//         residentQueryService.getHouseholdMemberDetail(
//           "member-1",
//           "", // empty userId
//           "ADMIN",
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 실패 : role 없음 (인증 실패)
//      */
//     it("should throw FORBIDDEN when role is missing", async () => {
//       await expect(
//         residentQueryService.getHouseholdMemberDetail(
//           "member-1",
//           "admin-user-1",
//           "", // empty role
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 실패 : 권한이 ADMIN이 아님 (USER 역할)
//      */
//     it("should throw FORBIDDEN when user is not ADMIN", async () => {
//       await expect(
//         residentQueryService.getHouseholdMemberDetail(
//           "member-1",
//           "user-1",
//           "USER", // not ADMIN
//         ),
//       ).rejects.toThrow(BusinessException);
//     });

//     /**
//      * 성공 : 모든 필드 매핑 검증
//      */
//     it("should map all member fields correctly", async () => {
//       // Arrange
//       mockRepository.findHouseholdMemberById.mockResolvedValue(
//         mockHouseholdMember,
//       );

//       const result = await residentQueryService.getHouseholdMemberDetail(
//         "member-1",
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result).toHaveProperty("id", "member-1");
//       expect(result).toHaveProperty("email", "test@example.com");
//       expect(result).toHaveProperty("contact", "010-1234-5678");
//       expect(result).toHaveProperty("name", "홍길동");
//       expect(result).toHaveProperty("building", 1);
//       expect(result).toHaveProperty("unit", 101);
//       expect(result).toHaveProperty("isHouseholder", true);
//       expect(result).toHaveProperty("userId", "user-1");
//       expect(result).toHaveProperty("createdAt");
//     });
//   });

//   describe("Integration Scenarios", () => {
//     /**
//      * 목록 조회 후 특정 항목 상세 조회
//      */
//     it("should get list and then get detail of a member", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [mockHouseholdMember, mockHouseholdMember2],
//         total: 2,
//       });

//       const listResult = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(listResult.data).toHaveLength(2);
//       const firstMemberId = listResult.data[0].id;

//       mockRepository.findHouseholdMemberById.mockResolvedValue(
//         mockHouseholdMember,
//       );

//       const detailResult = await residentQueryService.getHouseholdMemberDetail(
//         firstMemberId,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(detailResult.id).toBe(listResult.data[0].id);
//       expect(detailResult.email).toBe(listResult.data[0].email);
//       expect(detailResult.name).toBe(listResult.data[0].name);
//     });

//     /**
//      * 여러 번의 목록 조회 with 다양한 페이지
//      */
//     it("should handle multiple list queries with different pages", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [mockHouseholdMember],
//         total: 50,
//       });

//       const page1 = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       const page2 = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         2,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       const page3 = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         3,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(page1.page).toBe(1);
//       expect(page1.hasNext).toBe(true);
//       expect(page2.page).toBe(2);
//       expect(page2.hasNext).toBe(true);
//       expect(page3.page).toBe(3);
//       expect(page3.hasNext).toBe(false);
//     });
//   });

//   describe("Edge Cases", () => {
//     it("should reject apartmentId with only whitespace", async () => {
//       await expect(
//         residentQueryService.getListHouseholdMembers(
//           "   ",
//           1,
//           20,
//           "admin-user-1",
//           "ADMIN",
//         ),
//       ).rejects.toThrow("apartmentId is required");
//     });

//     it("should handle very large page numbers", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [],
//         total: 20,
//       });

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         9999,
//         20,
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.page).toBe(9999);
//       expect(result.hasNext).toBe(false);
//     });

//     it("should work with limit = 1", async () => {
//       mockRepository.findHouseholdMembers.mockResolvedValue({
//         members: [mockHouseholdMember],
//         total: 100,
//       });

//       const result = await residentQueryService.getListHouseholdMembers(
//         "apartment-1",
//         1, //page
//         1, //limit
//         "admin-user-1",
//         "ADMIN",
//       );

//       expect(result.limit).toBe(1);
//       expect(result.hasNext).toBe(true);
//       expect(mockRepository.findHouseholdMembers).toHaveBeenCalledWith(
//         "apartment-1",
//         1,
//         1,
//       );
//     });
//   });
// });
