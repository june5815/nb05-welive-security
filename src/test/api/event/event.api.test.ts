import request from "supertest";
import { PrismaClient, NoticeCategory } from "@prisma/client";
import { Injector } from "../../../injector";
import bcrypt from "bcrypt";

jest.setTimeout(30000);

describe("Event API (E2E)", () => {
  let server: any;
  let prisma: PrismaClient;

  let agentAdmin: any;
  let apartmentId: string;
  let noticeId: string;

  beforeAll(async () => {
    const injector = Injector();
    server = (injector.httpServer as any).app || injector.httpServer;
    prisma = new PrismaClient();

    await prisma.event.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.refreshToken.deleteMany().catch(() => {});
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();

    // 아파트 생성
    const apartment = await prisma.apartment.create({
      data: {
        name: "Event 테스트 아파트",
        address: "서울시 강남구",
        description: "테스트 아파트입니다.",
        officeNumber: "02-123-4567",
        buildingNumberFrom: 1,
        buildingNumberTo: 2,
        floorCountPerBuilding: 10,
        unitCountPerFloor: 4,
      },
    });
    apartmentId = apartment.id;

    // 관리자 생성
    const adminPlainPw = "password";
    const adminHashedPw = await bcrypt.hash(adminPlainPw, 10);

    const admin = await prisma.user.create({
      data: {
        username: "admin_evt",
        password: adminHashedPw,
        name: "관리자",
        email: "admin_evt@test.com",
        contact: "010-0000-0000",
        role: "ADMIN",
        joinStatus: "APPROVED",
        isActive: true,
        adminOf: { connect: { id: apartmentId } },
      },
    });

    agentAdmin = request.agent(server);
    const loginRes = await agentAdmin
      .post("/api/v2/auth/login")
      .send({ username: "admin_evt", password: adminPlainPw });

    expect(loginRes.status).toBe(200);

    // 공지+이벤트 seed
    const notice = await prisma.notice.create({
      data: {
        title: "긴급 점검 일정 안내",
        content: "2월 15일 점검 예정",
        category: NoticeCategory.MAINTENANCE,
        type: "NORMAL",
        apartmentId,
        userId: admin.id,
        event: {
          create: {
            title: "긴급 점검",
            startDate: new Date(2023, 1, 15),
            endDate: new Date(2023, 1, 15, 23, 59, 59),
            apartmentId,
            resourceType: "NOTICE",
          },
        },
      },
    });
    noticeId = notice.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/v2/events", () => {
    it("해당 월 아파트 이벤트 목록을 조회한다 (200)", async () => {
      const res = await agentAdmin.get("/api/v2/events").query({
        apartmentId,
        year: 2023,
        month: 2,
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const evt = res.body[0];
      expect(evt).toHaveProperty("id");
      expect(evt).toHaveProperty("startDate");
      expect(evt).toHaveProperty("endDate");
      expect(evt).toHaveProperty("category");
      expect(evt).toHaveProperty("title");
      expect(evt).toHaveProperty("apartmentId");
      expect(evt).toHaveProperty("resourceId");
      expect(evt).toHaveProperty("resourceType");
    });

    it("필수 파라미터 누락 시 400 에러", async () => {
      const res = await agentAdmin.get("/api/v2/events").query({
        apartmentId,
        year: 2023,
        // month 누락시킴
      });

      expect(res.status).toBe(400);
    });
  });
});
