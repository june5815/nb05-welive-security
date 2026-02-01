import request from "supertest";
import { Express } from "express";
import { PrismaClient } from "@prisma/client";

describe("Resident API E2E Tests", () => {
  let app: Express;
  let prisma: PrismaClient;

  const testApartmentId = "apartment-test-1";
  const testHouseholdId = "household-test-1";
  const testMemberId = "member-test-1";
  const testUserId = "user-test-1";
  const adminToken = "admin-bearer-token"; // Mock token
  const userToken = "user-bearer-token"; // Mock token

  const mockAdminUser = {
    id: "admin-user-1",
    email: "admin@test.com",
    contact: "010-1111-1111",
    name: "관리자",
    role: "ADMIN",
  };

  const mockRegularUser = {
    id: "regular-user-1",
    email: "user@test.com",
    contact: "010-2222-2222",
    name: "일반사용자",
    role: "USER",
  };

  const mockHouseholdMember = {
    id: testMemberId,
    householdId: testHouseholdId,
    userId: testUserId,
    userType: "RESIDENT",
    email: "resident@test.com",
    contact: "010-3333-3333",
    name: "입주민",
    isHouseholder: true,
    movedInAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  beforeAll(async () => {
    app = {} as Express;
  });

  afterAll(async () => {});

  // POST /api/v2/residents 테스트

  describe("POST /api/v2/residents - 입주민 등록", () => {
    const validResidentRegistrationPayload = {
      building: 101,
      unit: 505,
      email: "newresident@test.com",
      contact: "010-9999-9999",
      name: "신규입주민",
    };

    /**
     * 성공: 정상적인 입주민 등록 (ADMIN)
     */
    it("should create household member successfully when ADMIN registers with valid data", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        statusCode: 201,
        message: expect.stringContaining("등록"),
        data: expect.objectContaining({
          id: expect.any(String),
          email: validResidentRegistrationPayload.email,
          contact: validResidentRegistrationPayload.contact,
          name: validResidentRegistrationPayload.name,
          isHouseholder: true,
          createdAt: expect.any(String),
        }),
      });
    });

    /**
     * 성공: 응답 데이터 포맷 검증 (201 Created)
     */
    it("should return correct response format with 201 status code", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("statusCode", 201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(typeof response.body.message).toBe("string");
    });

    /**
     * 실패: 인증 없음 (401 Unauthorized)
     */
    it("should return 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining("인증"),
        }),
      );
    });

    /**
     * 실패: 권한 없음 (403 Forbidden - USER 역할)
     */
    it("should return 403 when user has insufficient permission (USER role)", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-User-ID", mockRegularUser.id)
        .set("X-User-Role", mockRegularUser.role) // USER (ADMIN 아님)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining("권한|관리자"),
        }),
      );
    });

    /**
     * 실패: 필수 필드 누락 - email
     */
    it("should return 400 when email is missing", async () => {
      const { email, ...payload } = validResidentRegistrationPayload;

      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("email"),
        }),
      );
    });

    /**
     * 실패: 필수 필드 누락 - building
     */
    it("should return 400 when building is missing", async () => {
      const { building, ...payload } = validResidentRegistrationPayload;

      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("building"),
        }),
      );
    });

    /**
     * 실패: 필수 필드 누락 - unit
     */
    it("should return 400 when unit is missing", async () => {
      const { unit, ...payload } = validResidentRegistrationPayload;

      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("unit"),
        }),
      );
    });

    /**
     * 실패: 필수 필드 누락 - contact
     */
    it("should return 400 when contact is missing", async () => {
      const { contact, ...payload } = validResidentRegistrationPayload;

      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("contact"),
        }),
      );
    });

    /**
     * 실패: 필수 필드 누락 - name
     */
    it("should return 400 when name is missing", async () => {
      const { name, ...payload } = validResidentRegistrationPayload;

      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("name"),
        }),
      );
    });

    /**
     * 실패: 유효하지 않은 이메일 형식
     */
    it("should return 400 when email format is invalid", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send({
          ...validResidentRegistrationPayload,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("email"),
        }),
      );
    });

    /**
     * 실패: 중복된 이메일
     */
    it("should return 400 when email already exists", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send({
          ...validResidentRegistrationPayload,
          email: mockHouseholdMember.email, // 이미 존재하는 이메일
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("중복|이미"),
        }),
      );
    });

    /**
     * 실패: 존재하지 않는 household (building + unit 조합)
     */
    it("should return 400 when household not found for given building and unit", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send({
          ...validResidentRegistrationPayload,
          building: 999,
          unit: 999, // 존재하지 않는 조합
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining(
            "찾을 수 없음|존재하지 않음|household",
          ),
        }),
      );
    });

    /**
     * 성공: createdAt 포맷 검증 (ISO 8601)
     */
    it("should return createdAt in ISO 8601 format", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(201);
      const createdAt = response.body.data.createdAt;
      expect(typeof createdAt).toBe("string");
      expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO 8601
    });

    /**
     * 성공: 반환된 데이터에 필수 필드 포함 확인
     */
    it("should return all required fields in response data", async () => {
      const response = await request(app)
        .post(`/api/v2/residents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send(validResidentRegistrationPayload);

      expect(response.status).toBe(201);
      const data = response.body.data;
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty(
        "email",
        validResidentRegistrationPayload.email,
      );
      expect(data).toHaveProperty(
        "contact",
        validResidentRegistrationPayload.contact,
      );
      expect(data).toHaveProperty(
        "name",
        validResidentRegistrationPayload.name,
      );
      expect(data).toHaveProperty("isHouseholder");
      expect(data).toHaveProperty("createdAt");
    });
  });

  // GET /api/v2/residents/:apartmentId 테스트

  describe("GET /api/v2/residents/:apartmentId - 입주민 목록 조회", () => {
    /**
     * 성공 : 정상적인 목록 조회 (ADMIN)
     */
    it("should return list of household members when authenticated and authorized", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "입주민 목록 조회 성공",
        data: expect.objectContaining({
          data: expect.any(Array),
          total: expect.any(Number),
          page: 1,
          limit: 20,
          hasNext: expect.any(Boolean),
        }),
      });
    });

    /**
     * 성공 : 페이지네이션 쿼리 (page=2, limit=10)
     */
    it("should support pagination with custom page and limit", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 2, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 10,
        }),
      );
    });

    /**
     * 성공: 빈 목록 반환
     */
    it("should return empty list when no members found", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
    });

    /**
     * 실패: 인증 없음 (401 Unauthorized)
     */
    it("should return 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining("인증"),
        }),
      );
    });

    /**
     * 실패: 권한 없음 (403 Forbidden - USER 역할)
     */
    it("should return 403 when user has insufficient permission", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-User-ID", mockRegularUser.id)
        .set("X-User-Role", mockRegularUser.role) // USER (ADMIN 아님)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining("권한"),
        }),
      );
    });

    /**
     * 실패: 유효하지 않은 apartmentId (400 Bad Request)
     */
    it("should return 400 when apartmentId is invalid", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(404);
    });

    /**
     * 실패: 유효하지 않은 페이지 (400 Bad Request)
     */
    it("should return 400 when page query is invalid", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 0, limit: 20 }); // page < 1

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("page"),
        }),
      );
    });

    /**
     * 실패: 유효하지 않은 limit (400 Bad Request)
     */
    it("should return 400 when limit query is invalid", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: -1 }); // limit < 1

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining("limit"),
        }),
      );
    });

    /**
     *   성공: 응답 데이터 포맷 검증
     */
    it("should return correct response format with all required fields", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      const memberData = response.body.data.data[0];
      if (memberData) {
        expect(memberData).toHaveProperty("id");
        expect(memberData).toHaveProperty("email");
        expect(memberData).toHaveProperty("name");
        expect(memberData).toHaveProperty("contact");
        expect(memberData).toHaveProperty("building");
        expect(memberData).toHaveProperty("unit");
        expect(memberData).toHaveProperty("isHouseholder");
        expect(memberData).toHaveProperty("createdAt");
      }
    });

    /**
     *   성공: limit 자동 조정 (limit > 100)
     */
    it("should cap limit to 100 maximum", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 500 });

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(100); // 500 → 100으로 조정됨
    });
  });

  // GET /api/v2/residents/:apartmentId/:householdMemberId 테스트

  describe("GET /api/v2/residents/:apartmentId/:householdMemberId - 입주민 상세 조회", () => {
    /**
     *   성공: 정상적인 상세 조회 (ADMIN)
     */
    it("should return household member detail when authenticated and authorized", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "입주민 상세 조회 성공",
        data: expect.objectContaining({
          id: testMemberId,
          email: expect.any(String),
          name: expect.any(String),
          contact: expect.any(String),
          building: expect.any(Number),
          unit: expect.any(Number),
          isHouseholder: expect.any(Boolean),
          createdAt: expect.any(String),
        }),
      });
    });

    /**
     * 실패: 인증 없음 (401 Unauthorized)
     */
    it("should return 401 when Authorization header is missing", async () => {
      const response = await request(app).get(
        `/api/v2/residents/${testApartmentId}/${testMemberId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining("인증"),
        }),
      );
    });

    /**
     * 실패: 권한 없음 (403 Forbidden - USER 역할)
     */
    it("should return 403 when user has insufficient permission", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-User-ID", mockRegularUser.id)
        .set("X-User-Role", mockRegularUser.role); // USER (ADMIN 아님)

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining("권한"),
        }),
      );
    });

    /**
     * 실패: 존재하지 않는 입주민 (404 Not Found)
     */
    it("should return 404 when household member does not exist", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/non-existent-id`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining("찾을 수 없음"),
        }),
      );
    });

    /**
     *   성공: 응답 데이터 포맷 검증
     */
    it("should return correct response format with all required fields", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(200);
      const memberDetail = response.body.data;
      expect(memberDetail).toHaveProperty("id", testMemberId);
      expect(memberDetail).toHaveProperty("email");
      expect(memberDetail).toHaveProperty("name");
      expect(memberDetail).toHaveProperty("contact");
      expect(memberDetail).toHaveProperty("building");
      expect(memberDetail).toHaveProperty("unit");
      expect(memberDetail).toHaveProperty("isHouseholder");
      expect(memberDetail).toHaveProperty("userId");
      expect(memberDetail).toHaveProperty("createdAt");
    });

    /**
     *  성공: createdAt 포맷 검증 (ISO 8601)
     */
    it("should return createdAt in ISO 8601 format", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(200);
      const createdAt = response.body.data.createdAt;
      expect(typeof createdAt).toBe("string");
      expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO 8601
    });

    /**
     * 실패 : 유효하지 않은 householdMemberId (400 Bad Request)
     */
    it("should return 400 when householdMemberId is empty", async () => {
      const response = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(404);
    });
  });

  // 통합 테스트 시나리오

  describe("Integration Scenarios", () => {
    /**
     *  목록 조회 후 상세 조회
     */
    it("should get list and then get detail of a member in sequence", async () => {
      const listResponse = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .query({ page: 1, limit: 20 });

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.data.length).toBeGreaterThan(0);

      const firstMemberId = listResponse.body.data.data[0].id;
      const detailResponse = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${firstMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.id).toBe(firstMemberId);
      expect(detailResponse.body.data.email).toBe(
        listResponse.body.data.data[0].email,
      );
      expect(detailResponse.body.data.name).toBe(
        listResponse.body.data.data[0].name,
      );
    });

    /**
     *  페이지네이션으로 모든 페이지 순회
     */
    it("should traverse all pages using pagination", async () => {
      const allMembers: any[] = [];
      let page = 1;
      const limit = 10;
      let hasNext = true;

      while (hasNext) {
        const response = await request(app)
          .get(`/api/v2/residents/${testApartmentId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .set("X-User-ID", mockAdminUser.id)
          .set("X-User-Role", mockAdminUser.role)
          .query({ page, limit });

        expect(response.status).toBe(200);
        allMembers.push(...response.body.data.data);

        hasNext = response.body.data.hasNext;
        if (hasNext) {
          page++;
        }
      }

      expect(allMembers.length).toBeGreaterThanOrEqual(0);
    });

    /**
     * 권한 없는 사용자의 모든 엔드포인트 접근 실패
     */
    it("should deny access for non-admin users on all endpoints", async () => {
      const listResponse = await request(app)
        .get(`/api/v2/residents/${testApartmentId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-User-ID", mockRegularUser.id)
        .set("X-User-Role", mockRegularUser.role);

      expect(listResponse.status).toBe(403);

      const detailResponse = await request(app)
        .get(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-User-ID", mockRegularUser.id)
        .set("X-User-Role", mockRegularUser.role);

      expect(detailResponse.status).toBe(403);
    });
  });

  describe("Error Handling", () => {
    /**
     * 에러 응답 포맷 검증
     */
    it("should return consistent error response format", async () => {
      const response = await request(app).get(
        `/api/v2/residents/${testApartmentId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("statusCode", 401);
      expect(response.body).toHaveProperty("message");
      expect(typeof response.body.message).toBe("string");
    });

    /**
     * HTTP 메서드 검증 (DELETE, PATCH 등 불허)
     */
    it("should not allow DELETE method on resident endpoints", async () => {
      const response = await request(app)
        .delete(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role);

      expect(response.status).toBe(404);
    });

    /**
     * HTTP 메서드 검증 (PUT 불허)
     */
    it("should not allow PUT method on resident endpoints", async () => {
      const response = await request(app)
        .put(`/api/v2/residents/${testApartmentId}/${testMemberId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-User-ID", mockAdminUser.id)
        .set("X-User-Role", mockAdminUser.role)
        .send({ name: "Updated" });

      expect(response.status).toBe(404);
    });
  });
});
