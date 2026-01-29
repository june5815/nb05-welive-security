// import request from "supertest";
// import { PrismaClient } from "@prisma/client";
// import * as bcrypt from "bcrypt";
// import { Injector } from "../../../injector";

// jest.setTimeout(30000);

// describe("Auth Module E2E Test", () => {
//   let app: any;
//   const prisma = new PrismaClient();

//   const testUser = {
//     username: "e2e_auth_user",
//     password: "password123!",
//     email: "e2e_auth@test.com",
//     contact: "01099998888",
//     name: "E2E Tester",
//   };

//   const pendingUser = {
//     username: "pending_user",
//     password: "password123!",
//     email: "pending@test.com",
//     contact: "01088887777",
//     name: "Pending User",
//   };

//   const rejectUser = {
//     username: "reject_user",
//     password: "password123!",
//     email: "reject@test.com",
//     contact: "01077776666",
//     name: "Reject User",
//   };

//   beforeAll(async () => {
//     const { httpServer } = Injector();
//     app = httpServer.app;

//     await prisma.refreshToken.deleteMany();
//     await prisma.user.deleteMany({
//       where: {
//         username: { in: [testUser.username, pendingUser.username, rejectUser.username] },
//       },
//     });

//     const hashedPassword = await bcrypt.hash(testUser.password, 10);
//     await prisma.user.create({
//       data: {
//         username: testUser.username,
//         password: hashedPassword,
//         email: testUser.email,
//         contact: testUser.contact,
//         name: testUser.name,
//         role: "USER",
//         joinStatus: "APPROVED", // 로그인 가능 상태
//         isActive: true,
//       },
//     });

//     // 4. 승인 대기(PENDING) 유저 생성 (로그인 실패 테스트용)
//     await prisma.user.create({
//       data: {
//         username: pendingUser.username,
//         password: hashedPassword,
//         email: pendingUser.email,
//         contact: pendingUser.contact,
//         name: pendingUser.name,
//         role: "USER",
//         joinStatus: "PENDING", // 로그인 불가능 상태
//         isActive: false,
//       },
//     });

//     // 5. 거부(REJECT) 유저 생성 (로그인 실패 테스트용)
//     await prisma.user.create({
//       data: {
//         username: rejectUser.username,
//         password: hashedPassword,
//         email: rejectUser.email,
//         contact: rejectUser.contact,
//         name: rejectUser.name,
//         role: "USER",
//         joinStatus: "REJECTED", // 로그인 불가능 상태
//         isActive: false,
//       },
//     });
//     await prisma.$disconnect();
//   });

//   let accessToken: string;
//   let refreshTokenCookie: string;
//   let userId: string;

//   // ==========================================
//   // 1. 로그인 (POST /api/v2/auth/login)
//   // ==========================================
//   describe("POST /api/v2/auth/login", () => {
//     it("성공: 유효한 정보로 로그인 시 토큰을 발급하고, DB에 리프레시 토큰이 '해싱'되어 저장되어야 한다.", async () => {
//       const res = await request(app).post("/api/v2/auth/login").send({
//         username: testUser.username,
//         password: testUser.password,
//       });

//       // 1-1. 응답 상태 및 구조 확인
//       expect(res.status).toBe(201);

//       // 서비스가 { loginResDto, tokenResDto } 구조로 반환하므로 이에 맞춰 검증
//       expect(res.body).toHaveProperty("loginResDto");
//       expect(res.body).toHaveProperty("tokenResDto");

//       const { loginResDto, tokenResDto } = res.body;

//       expect(loginResDto.username).toBe(testUser.username);
//       expect(tokenResDto.accessToken).toBeDefined();
//       expect(tokenResDto.csrfValue).toBeDefined();

//       // 변수 저장
//       accessToken = tokenResDto.accessToken;
//       userId = loginResDto.id;

//       // 1-2. 쿠키 확인 (RefreshToken)
//       const cookies = res.headers["set-cookie"];
//       expect(cookies).toBeDefined();
//       const refreshCookie = cookies.find((c: string) =>
//         c.includes("refreshToken")
//       );
//       expect(refreshCookie).toBeDefined();
//       expect(refreshCookie).toMatch(/HttpOnly/i); // 보안 쿠키 확인

//       // 쿠키 값 파싱 (다음 요청을 위해)
//       refreshTokenCookie = refreshCookie.split(";")[0]; // "refreshToken=..."

//       // 1-3. [중요] DB 저장 검증 (해싱 여부)
//       const storedToken = await prisma.refreshToken.findUnique({
//         where: { userId },
//       });
//       expect(storedToken).not.toBeNull();

//       // 쿠키의 토큰 값 추출 ("refreshToken=값" -> "값")
//       const plainRefreshToken = refreshTokenCookie.split("=")[1];

//       // DB의 값과 쿠키의 값이 '그냥' 같으면 안 됨 (해싱되어야 함)
//       expect(storedToken?.refreshToken).not.toBe(plainRefreshToken);

//       // bcrypt로 비교했을 때 일치해야 함
//       const isMatch = await bcrypt.compare(
//         plainRefreshToken,
//         storedToken!.refreshToken
//       );
//       expect(isMatch).toBe(true);
//     });

//     it("실패: 비밀번호가 틀리면 401(또는 예외처리 코드)을 반환해야 한다.", async () => {
//       const res = await request(app).post("/api/v2/auth/login").send({
//         username: testUser.username,
//         password: "wrong_password",
//       });

//       // BusinessExceptionType.INVALID_AUTH -> 보통 401 Unauthorized
//       expect(res.status).toBeGreaterThanOrEqual(400);
//     });

//     it("실패: 승인 대기(PENDING) 상태인 유저는 로그인할 수 없다.", async () => {
//       const res = await request(app).post("/api/v2/auth/login").send({
//         username: pendingUser.username,
//         password: pendingUser.password,
//       });

//       // BusinessExceptionType.STATUS_IS_PENDING -> 403 Forbidden 권장
//       expect(res.status).toBeGreaterThanOrEqual(400);
//       expect(res.body.message).toMatch(/대기|승인|pending/i); // 에러 메시지 확인 (선택)
//     });
//   });

//   // ==========================================
//   // 2. 토큰 갱신 (POST /api/v2/auth/refresh)
//   // ==========================================
//   describe("POST /api/v2/auth/refresh", () => {
//     it("성공: 유효한 쿠키로 요청 시 토큰을 재발급하고, DB 토큰도 교체(RTR)되어야 한다.", async () => {
//       // 갱신 전 DB 토큰 가져오기 (비교용)
//       const beforeToken = await prisma.refreshToken.findUnique({
//         where: { userId },
//       });

//       const res = await request(app)
//         .post("/api/v2/auth/refresh")
//         .set("Cookie", [refreshTokenCookie]) // 쿠키 전송
//         .send();

//       expect(res.status).toBe(201); // Created
//       expect(res.body).toHaveProperty("newAccessToken");

//       // 2-1. 새 쿠키 확인
//       const cookies = res.headers["set-cookie"];
//       const newRefreshCookie = cookies.find((c: string) =>
//         c.includes("refreshToken")
//       );
//       expect(newRefreshCookie).toBeDefined();

//       // 2-2. [중요] DB 토큰 변경 확인 (RTR)
//       const afterToken = await prisma.refreshToken.findUnique({
//         where: { userId },
//       });

//       // DB의 토큰 해시값이 바뀌었어야 함
//       expect(beforeToken?.refreshToken).not.toBe(afterToken?.refreshToken);

//       // 변수 업데이트
//       refreshTokenCookie = newRefreshCookie.split(";")[0];
//       accessToken = res.body.newAccessToken;
//     });

//     it("실패: 쿠키 없이 요청하면 400/401 에러를 반환해야 한다.", async () => {
//       const res = await request(app).post("/api/v2/auth/refresh").send();
//       expect(res.status).toBeGreaterThanOrEqual(400);
//     });
//   });

//   // ==========================================
//   // 3. 로그아웃 (POST /api/v2/auth/logout)
//   // ==========================================
//   describe("POST /api/v2/auth/logout", () => {
//     it("성공: 로그아웃 시 DB에서 리프레시 토큰이 삭제되고 쿠키가 만료되어야 한다.", async () => {
//       const res = await request(app)
//         .post("/api/v2/auth/logout")
//         .set("Authorization", `Bearer ${accessToken}`) // AccessToken 헤더
//         .set("Cookie", [refreshTokenCookie]) // RefreshToken 쿠키
//         .send();

//       expect(res.status).toBe(200);

//       // 3-1. 쿠키 만료 확인
//       const cookies = res.headers["set-cookie"];
//       const logoutCookie = cookies.find((c: string) =>
//         c.includes("refreshToken")
//       );
//       // Max-Age=0 또는 Expires가 과거 날짜인지 확인
//       expect(logoutCookie).toMatch(/Max-Age=0|Expires/);

//       // 3-2. [중요] DB 삭제 확인
//       const storedToken = await prisma.refreshToken.findUnique({
//         where: { userId },
//       });
//       expect(storedToken).toBeNull(); // 데이터가 없어야 함
//     });
//   });
// });
