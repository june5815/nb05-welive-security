import request from "supertest";
import { PrismaClient, CommentResourceType } from "@prisma/client";
import bcrypt from "bcrypt";
import { Injector } from "../../../injector";

jest.setTimeout(30000);

describe("Comment API (E2E)", () => {
  const prisma = new PrismaClient();
  let app: any;

  let agentAdmin: any;
  let agentUser: any; // 작성자
  let agentOtherUser: any; // 다른 입주민

  let apartmentId: string;
  let adminId: string;
  let user1Id: string;
  let user2Id: string;
  let noticeId: string;
  let createdCommentId: string;

  const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

  beforeAll(async () => {
    const injector = Injector();
    app = injector.httpServer.app;

    await prisma.notificationReceipt.deleteMany().catch(() => {});
    await prisma.notificationEvent.deleteMany().catch(() => {});
    await prisma.comment.deleteMany();
    await prisma.event.deleteMany().catch(() => {});
    await prisma.notice.deleteMany();
    await prisma.refreshToken.deleteMany().catch(() => {});
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();

    // 1) 아파트
    const apartment = await prisma.apartment.create({
      data: {
        name: "댓글 테스트 아파트",
        address: "주소",
        description: "설명",
        officeNumber: "02-000-0000",
        buildingNumberFrom: 1,
        buildingNumberTo: 2,
        floorCountPerBuilding: 10,
        unitCountPerFloor: 2,
      },
    });
    apartmentId = apartment.id;

    // 2) admin
    const adminPlainPw = "password";
    const adminHashedPw = await hashPassword(adminPlainPw);

    const admin = await prisma.user.create({
      data: {
        username: "admin_c",
        password: adminHashedPw,
        name: "관리자",
        email: "admin_c@test.com",
        contact: "010-0000-0000",
        role: "ADMIN",
        joinStatus: "APPROVED",
        isActive: true,
        adminOf: { connect: { id: apartmentId } },
      },
    });
    adminId = admin.id;

    // 3) user1, user2
    const userPlainPw = "password";
    const userHashedPw = await hashPassword(userPlainPw);

    const user1 = await prisma.user.create({
      data: {
        username: "user1_c",
        password: userHashedPw,
        name: "입주민1",
        email: "u1_c@test.com",
        contact: "010-1111-1111",
        role: "USER",
        joinStatus: "APPROVED",
        isActive: true,
      },
    });
    user1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        username: "user2_c",
        password: userHashedPw,
        name: "입주민2",
        email: "u2_c@test.com",
        contact: "010-2222-2222",
        role: "USER",
        joinStatus: "APPROVED",
        isActive: true,
      },
    });
    user2Id = user2.id;

    // 4) household + householdMember
    const household1 = await prisma.household.create({
      data: {
        apartmentId,
        building: 1,
        unit: 101,
        householdStatus: "ACTIVE",
      },
    });

    const household2 = await prisma.household.create({
      data: {
        apartmentId,
        building: 1,
        unit: 102,
        householdStatus: "ACTIVE",
      },
    });

    await prisma.householdMember.create({
      data: {
        householdId: household1.id,
        userId: user1Id,
        email: "u1_c@test.com",
        contact: "010-1111-1111",
        name: "입주민1",
        isHouseholder: true,
        userType: "RESIDENT",
      },
    });

    await prisma.householdMember.create({
      data: {
        householdId: household2.id,
        userId: user2Id,
        email: "u2_c@test.com",
        contact: "010-2222-2222",
        name: "입주민2",
        isHouseholder: true,
        userType: "RESIDENT",
      },
    });

    // 5) notice (댓글 대상)
    const notice = await prisma.notice.create({
      data: {
        title: "댓글 테스트용 공지",
        content: "내용",
        category: "COMMUNITY",
        type: "NORMAL",
        apartmentId,
        userId: adminId,
      },
    });
    noticeId = notice.id;

    agentAdmin = request.agent(app);
    agentUser = request.agent(app);
    agentOtherUser = request.agent(app);

    const rAdmin = await agentAdmin.post("/api/v2/auth/login").send({
      username: "admin_c",
      password: adminPlainPw,
    });
    expect(rAdmin.status).toBe(200);

    const rUser1 = await agentUser.post("/api/v2/auth/login").send({
      username: "user1_c",
      password: userPlainPw,
    });
    expect(rUser1.status).toBe(200);

    const rUser2 = await agentOtherUser.post("/api/v2/auth/login").send({
      username: "user2_c",
      password: userPlainPw,
    });
    expect(rUser2.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 댓글 생성
  describe("POST /api/v2/comments", () => {
    it("입주민이 공지사항에 댓글을 작성한다 (201)", async () => {
      const res = await agentUser.post("/api/v2/comments").send({
        content: "첫 번째 댓글입니다.",
        resourceId: noticeId,
        resourceType: "NOTICE",
      });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("첫 번째 댓글입니다.");
      expect(res.body.author?.name).toBe("입주민1");

      createdCommentId = res.body.id;

      // DB 반영 확인
      const saved = await prisma.comment.findUnique({
        where: { id: createdCommentId },
      });
      expect(saved).not.toBeNull();
    });

    it("필수 값 누락 시 400 에러", async () => {
      const res = await agentUser.post("/api/v2/comments").send({
        resourceId: noticeId,
        resourceType: "NOTICE",
      });

      expect(res.status).toBe(400);
    });
  });

  // 댓글 목록 조회
  describe("GET /api/v2/comments", () => {
    it("해당 공지사항 댓글 목록 조회 (200)", async () => {
      const res = await agentUser.get("/api/v2/comments").query({
        resourceId: noticeId,
        resourceType: "NOTICE",
        page: 1,
        limit: 10,
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 댓글 수정
  describe("PATCH /api/v2/comments/:commentId", () => {
    it("작성자는 자신의 댓글을 수정할 수 있다 (204)", async () => {
      const res = await agentUser
        .patch(`/api/v2/comments/${createdCommentId}`)
        .send({ content: "수정된 댓글 내용" });

      expect(res.status).toBe(204);

      const updated = await prisma.comment.findUnique({
        where: { id: createdCommentId },
      });
      expect(updated?.content).toBe("수정된 댓글 내용");
    });

    it("다른 입주민은 수정할 수 없다 (403)", async () => {
      const res = await agentOtherUser
        .patch(`/api/v2/comments/${createdCommentId}`)
        .send({ content: "해킹 시도" });

      expect([401, 403]).toContain(res.status);
    });
  });

  // 댓글 삭제
  describe("DELETE /api/v2/comments/:commentId", () => {
    it("다른 입주민은 삭제할 수 없다 (403)", async () => {
      const res = await agentOtherUser.delete(
        `/api/v2/comments/${createdCommentId}`,
      );

      expect([401, 403]).toContain(res.status);
    });

    it("작성자는 자신의 댓글을 삭제할 수 있다 (204)", async () => {
      const res = await agentUser.delete(
        `/api/v2/comments/${createdCommentId}`,
      );
      expect(res.status).toBe(204);

      const deleted = await prisma.comment.findUnique({
        where: { id: createdCommentId },
      });
      expect(deleted).toBeNull();
    });

    it("관리자는 타인의 댓글도 삭제할 수 있다 (204)", async () => {
      const temp = await prisma.comment.create({
        data: {
          content: "관리자 삭제용",
          resourceId: noticeId,
          resourceType: CommentResourceType.NOTICE,
          userId: user1Id,
        },
      });

      const res = await agentAdmin.delete(`/api/v2/comments/${temp.id}`);
      expect(res.status).toBe(204);

      const deleted = await prisma.comment.findUnique({
        where: { id: temp.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
