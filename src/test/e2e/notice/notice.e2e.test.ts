import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { Injector } from "../../../injector";

jest.setTimeout(30000);

describe("Notice API (E2E)", () => {
  const prisma = new PrismaClient();
  let app: any;
  let agentAdmin: any;
  let agentUser: any;

  let apartmentId: string;
  let adminId: string;
  let userId: string;
  let noticeId: string;

  beforeAll(async () => {
    const injector = Injector();
    app = injector.httpServer.app;

    await prisma.comment.deleteMany();
    await prisma.event.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();

    const apartment = await prisma.apartment.create({
      data: {
        name: "테스트 아파트",
        address: "서울시 강남구",
        description: "테스트용 아파트입니다.",
        officeNumber: "02-123-4567",
        buildingNumberFrom: 101,
        buildingNumberTo: 105,
        floorCountPerBuilding: 20,
        unitCountPerFloor: 4,
      },
    });
    apartmentId = apartment.id;

    const admin = await prisma.user.create({
      data: {
        username: "admin_test",
        password: "password123",
        name: "관리자",
        email: "admin@test.com",
        contact: "010-1111-1111",
        role: "ADMIN",
        joinStatus: "APPROVED",
        isActive: true,
        adminOf: { connect: { id: apartmentId } },
      },
    });
    adminId = admin.id;

    const user = await prisma.user.create({
      data: {
        username: "user_test",
        password: "password123",
        name: "입주민",
        email: "user@test.com",
        contact: "010-2222-2222",
        role: "USER",
        joinStatus: "APPROVED",
        isActive: true,
      },
    });
    userId = user.id;

    const household = await prisma.household.create({
      data: {
        apartmentId,
        building: 101,
        unit: 101,
        householdStatus: "ACTIVE",
      },
    });

    await prisma.householdMember.create({
      data: {
        householdId: household.id,
        userId,
        isHouseholder: true,
      },
    });

    agentAdmin = request.agent(app);
    agentUser = request.agent(app);

    await agentAdmin.post("/api/v2/auth/login").send({
      username: "admin_test",
      password: "password123",
    });

    await agentUser.post("/api/v2/auth/login").send({
      username: "user_test",
      password: "password123",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("관리자 공지 생성 POST /api/v2/notices (201)", async () => {
    const res = await agentAdmin.post("/api/v2/notices").send({
      title: "엘리베이터 점검 안내",
      content: "내일 오전 10시부터 점검합니다.",
      category: "MAINTENANCE",
      isPinned: true,
      apartmentId,
      event: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    noticeId = res.body.id;
  });

  it("입주민 공지 생성 불가 (role 체크) (401 or 403)", async () => {
    const res = await agentUser.post("/api/v2/notices").send({
      title: "입주민 공지",
      content: "내용",
      category: "COMMUNITY",
      apartmentId,
    });

    expect([401, 403]).toContain(res.status);
  });

  it("공지 목록 조회 GET /api/v2/notices (200)", async () => {
    const res = await agentUser.get("/api/v2/notices").query({
      page: 1,
      limit: 10,
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("공지 상세 조회 GET /api/v2/notices/:id (200)", async () => {
    const res = await agentUser.get(`/api/v2/notices/${noticeId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(noticeId);
  });

  it("공지 수정 PATCH /api/v2/notices/:id (204)", async () => {
    const res = await agentAdmin.patch(`/api/v2/notices/${noticeId}`).send({
      title: "수정된 제목",
      isPinned: false,
      event: null,
    });

    expect(res.status).toBe(204);
  });

  it("공지 삭제 DELETE /api/v2/notices/:id (204)", async () => {
    const res = await agentAdmin.delete(`/api/v2/notices/${noticeId}`);
    expect(res.status).toBe(204);
  });
});
