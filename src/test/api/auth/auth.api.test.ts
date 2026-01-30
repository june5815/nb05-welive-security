import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Injector } from "../../../injector";

jest.setTimeout(30000);

describe("Auth API 통합 테스트", () => {
  let app: any;
  const prisma = new PrismaClient();

  const testUser = {
    username: "e2e_auth_user",
    password: "password123!",
    email: "e2e_auth@test.com",
    contact: "01099998888",
    name: "E2E Tester",
  };
  const pendingUser = {
    username: "pending_user",
    password: "password123!",
    email: "pending@test.com",
    contact: "01088887777",
    name: "Pending User",
  };
  const rejectUser = {
    username: "reject_user",
    password: "password123!",
    email: "reject@test.com",
    contact: "01077776666",
    name: "Reject User",
  };

  let tokenCookie: string[];
  let userId: string;

  beforeAll(async () => {
    const { httpServer } = Injector();
    app = httpServer.app;

    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        username: testUser.username,
        password: hashedPassword,
        email: testUser.email,
        contact: testUser.contact,
        name: testUser.name,
        role: "USER",
        joinStatus: "APPROVED",
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        username: pendingUser.username,
        password: hashedPassword,
        email: pendingUser.email,
        contact: pendingUser.contact,
        name: pendingUser.name,
        role: "USER",
        joinStatus: "PENDING",
        isActive: false,
      },
    });
    await prisma.user.create({
      data: {
        username: rejectUser.username,
        password: hashedPassword,
        email: rejectUser.email,
        contact: rejectUser.contact,
        name: rejectUser.name,
        role: "USER",
        joinStatus: "REJECTED",
        isActive: false,
      },
    });
  });
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(async () => {
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /api/v2/auth/login", () => {
    test("성공: 유효한 정보로 로그인 시 쿠키에 토큰들을 설정하고, DB에 리프레시 토큰이 '해싱'되어 저장되어야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: testUser.username,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty("accessToken");
      expect(res.body).not.toHaveProperty("refreshToken");

      expect(res.body).toHaveProperty("id");
      expect(res.body.username).toBe(testUser.username);
      expect(res.body.role).toBe("USER");

      userId = res.body.id;
      const cookies = res.headers["set-cookie"] as unknown as string[];

      expect(cookies).toBeDefined();

      const findCookie = (name: string) =>
        cookies.find((c: string) => c.startsWith(`${name}=`));
      const accessCookie = findCookie("access_token");
      const refreshCookie = findCookie("refresh_token");
      const csrfCookie = findCookie("csrf_token");

      expect(accessCookie).toBeDefined();
      expect(refreshCookie).toBeDefined();
      expect(csrfCookie).toBeDefined();

      expect(refreshCookie).toMatch(/HttpOnly/i);

      tokenCookie = cookies;

      const rawCookieValue = refreshCookie!.split(";")[0].split("=")[1];
      const decodedValue = decodeURIComponent(rawCookieValue);
      const plainRefreshToken = decodedValue.slice(
        2,
        decodedValue.lastIndexOf("."),
      );
      const storedToken = await prisma.refreshToken.findUnique({
        where: { userId },
      });

      expect(storedToken).not.toBeNull();
      expect(storedToken?.refreshToken).not.toBe(plainRefreshToken);

      const isMatch = await bcrypt.compare(
        plainRefreshToken,
        storedToken!.refreshToken,
      );

      expect(isMatch).toBe(true);
    });

    test("실패: 아이디가 틀리면 상태 코드 400 INVALID_AUTH 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: "wrong_username",
        password: testUser.password,
      });

      expect(res.status).toEqual(400);
      expect(res.body.message).toMatch(
        "이메일 또는 비밀번호가 일치하지 않아요.",
      );
    });

    test("실패: 비밀번호가 틀리면 상태 코드 400 INVALID_AUTH 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: testUser.username,
        password: "wrong_password",
      });

      expect(res.status).toEqual(400);
      expect(res.body.message).toMatch(
        "이메일 또는 비밀번호가 일치하지 않아요.",
      );
    });

    test("실패: 승인 대기(PENDING) 상태인 유저는 로그인할 수 없다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: pendingUser.username,
        password: pendingUser.password,
      });

      expect(res.status).toEqual(401);
      expect(res.body.message).toMatch(
        "계정 승인 대기 중입니다. 승인 후 서비스 이용이 가능합니다.",
      );
    });

    test("실패: 거절된(REJECTED) 상태인 유저는 로그인할 수 없다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: rejectUser.username,
        password: rejectUser.password,
      });

      expect(res.status).toEqual(401);
      expect(res.body.message).toMatch("비활성화된 계정입니다.");
    });
  });

  describe("POST /api/v2/auth/refresh", () => {
    test("성공: 유효한 쿠키로 요청 시 토큰을 재발급하고(쿠키 갱신), DB 토큰도 교체되어야 한다.", async () => {
      const beforeToken = await prisma.refreshToken.findUnique({
        where: { userId },
      });
      const res = await request(app)
        .post("/api/v2/auth/refresh")
        .set("Cookie", tokenCookie)
        .send();

      expect(res.status).toBe(204);

      const newCookies = res.headers["set-cookie"] as unknown as string[];

      expect(newCookies).toBeDefined();

      const newRefreshCookie = newCookies.find((c) =>
        c.startsWith("refresh_token="),
      );

      expect(newRefreshCookie).toBeDefined();

      const afterToken = await prisma.refreshToken.findUnique({
        where: { userId },
      });

      expect(beforeToken?.refreshToken).not.toBe(afterToken?.refreshToken);

      tokenCookie = newCookies;
    });

    test("실패: 쿠키에 리프레시 토큰이 없으면 상태 코드 400 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/refresh").send();

      // zod가 처리하여 400 반환
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "Invalid input: expected string, received undefined",
      );
    });
  });

  describe("POST /api/v2/auth/logout", () => {
    test("성공: 로그아웃 시 DB에서 리프레시 토큰이 삭제되고 쿠키가 만료되어야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/auth/logout")
        .set("Cookie", tokenCookie)
        .send();

      expect(res.status).toBe(204);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { userId },
      });

      expect(storedToken).toBeNull();

      const logoutCookies = res.headers["set-cookie"] as unknown as string[];
      const refreshCookie = logoutCookies.find((c) =>
        c.startsWith("refresh_token="),
      );

      expect(refreshCookie).toMatch(/Max-Age=0|Expires/);
    });
  });

  test("실패: 쿠키에 리프레시 토큰이 없으면 상태 코드 401 UNAUTHORIZED_REQUEST 에러를 반환해야 한다.", async () => {
    const res = await request(app).post("/api/v2/auth/logout").send();

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch("권한이 없어요.");
  });

  test("실패: 로그아웃을 한 상태에서 다시 로그아웃 요청시 상태 코드 401 UNAUTHORIZED_REQUEST 에러를 반환해야 한다.", async () => {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const res = await request(app)
      .post("/api/v2/auth/logout")
      .set("Cookie", tokenCookie)
      .send();

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch("권한이 없어요.");
  });
});
