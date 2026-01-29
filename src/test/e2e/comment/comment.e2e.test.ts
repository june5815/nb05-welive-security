// import request from "supertest";
// import { PrismaClient, CommentResourceType } from "@prisma/client";
// import { Injector } from "../../../injector";

// jest.setTimeout(30000);

// describe("Comment API (E2E)", () => {
//   let server: any;
//   let prisma: PrismaClient;

//   let adminAccessToken: string;
//   let userAccessToken: string;
//   let otherUserAccessToken: string; // 다른 입주민 (수정 권한 체크용)

//   let noticeId: string;
//   let createdCommentId: string;

//   beforeAll(async () => {
//     const injector = Injector();
//     server = (injector.httpServer as any).app || injector.httpServer;
//     prisma = new PrismaClient();

//     await prisma.comment.deleteMany();
//     await prisma.notice.deleteMany();
//     await prisma.householdMember.deleteMany();
//     await prisma.household.deleteMany();
//     await prisma.user.deleteMany();
//     await prisma.apartment.deleteMany();

//     const apartment = await prisma.apartment.create({
//       data: {
//         name: "댓글 테스트 아파트",
//         address: "주소",
//         officeNumber: "02-000-0000",
//         description: "설명",
//         buildingNumberFrom: 1,
//         buildingNumberTo: 2,
//         floorCountPerBuilding: 10,
//         unitCountPerFloor: 2,
//       },
//     });

//     // 관리자
//     const admin = await prisma.user.create({
//       data: {
//         username: "admin_c",
//         password: "password",
//         name: "관리자",
//         email: "admin_c@test.com",
//         contact: "010-0000-0000",
//         role: "ADMIN",
//         joinStatus: "APPROVED",
//         isActive: true,
//         adminOf: { connect: { id: apartment.id } },
//       },
//     });

//     // 입주민 1 (작성자)
//     const user1 = await prisma.user.create({
//       data: {
//         username: "user1_c",
//         password: "password",
//         name: "입주민1",
//         email: "u1_c@test.com",
//         contact: "010-1111-1111",
//         role: "USER",
//         joinStatus: "APPROVED",
//         isActive: true,
//         resident: {
//           create: {
//             household: {
//               create: {
//                 apartmentId: apartment.id,
//                 building: 1,
//                 unit: 101,
//                 householdStatus: "ACTIVE",
//               },
//             },
//             isHouseholder: true,
//           },
//         },
//       },
//     });

//     // 입주민 2
//     const user2 = await prisma.user.create({
//       data: {
//         username: "user2_c",
//         password: "password",
//         name: "입주민2",
//         email: "u2_c@test.com",
//         contact: "010-2222-2222",
//         role: "USER",
//         joinStatus: "APPROVED",
//         isActive: true,
//         resident: {
//           create: {
//             household: {
//               create: {
//                 apartmentId: apartment.id,
//                 building: 1,
//                 unit: 102,
//                 householdStatus: "ACTIVE",
//               },
//             },
//             isHouseholder: true,
//           },
//         },
//       },
//     });

//     // 토큰 발급
//     const login = async (u: string, p: string) => {
//       const res = await request(server)
//         .post("/api/v2/auth/login")
//         .send({ username: u, password: p });
//       return res.body.accessToken;
//     };

//     adminAccessToken = await login("admin_c", "password");
//     userAccessToken = await login("user1_c", "password");
//     otherUserAccessToken = await login("user2_c", "password");

//     // 3. 댓글 달 대상(공지사항) 생성
//     const notice = await prisma.notice.create({
//       data: {
//         title: "댓글 테스트용 공지",
//         content: "내용",
//         category: "COMMUNITY",
//         type: "NORMAL",
//         apartmentId: apartment.id,
//         userId: admin.id,
//       },
//     });
//     noticeId = notice.id;
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   // 댓글 생성
//   describe("POST /api/v2/comments", () => {
//     it("입주민이 공지사항에 댓글을 작성한다 (201)", async () => {
//       const res = await request(server)
//         .post("/api/v2/comments")
//         .set("Authorization", `Bearer ${userAccessToken}`)
//         .send({
//           content: "첫 번째 댓글입니다.",
//           resourceId: noticeId,
//           resourceType: "NOTICE",
//         });

//       expect(res.status).toBe(201);
//       expect(res.body.content).toBe("첫 번째 댓글입니다.");
//       expect(res.body.author.name).toBe("입주민1");

//       createdCommentId = res.body.id;
//     });

//     it("필수 값이 누락되면 400 에러", async () => {
//       const res = await request(server)
//         .post("/api/v2/comments")
//         .set("Authorization", `Bearer ${userAccessToken}`)
//         .send({
//           resourceId: noticeId,
//           resourceType: "NOTICE",
//         });
//       expect(res.status).toBe(400);
//     });
//   });

//   // 댓글 목록 조회
//   describe("GET /api/v2/comments", () => {
//     it("해당 공지사항의 댓글 목록을 조회한다 (200)", async () => {
//       const res = await request(server)
//         .get("/api/v2/comments")
//         .query({
//           resourceId: noticeId,
//           resourceType: "NOTICE",
//           page: 1,
//           limit: 10,
//         })
//         .set("Authorization", `Bearer ${userAccessToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data).toHaveLength(1);
//       expect(res.body.data[0].content).toBe("첫 번째 댓글입니다.");
//     });
//   });

//   // 댓글 수정
//   describe("PATCH /api/v2/comments/:commentId", () => {
//     it("작성자는 자신의 댓글을 수정할 수 있다 (204)", async () => {
//       const res = await request(server)
//         .patch(`/api/v2/comments/${createdCommentId}`)
//         .set("Authorization", `Bearer ${userAccessToken}`)
//         .send({
//           content: "수정된 댓글 내용",
//         });

//       expect(res.status).toBe(204);

//       const updated = await prisma.comment.findUnique({
//         where: { id: createdCommentId },
//       });
//       expect(updated?.content).toBe("수정된 댓글 내용");
//     });

//     it("다른 입주민은 수정할 수 없다 (403)", async () => {
//       const res = await request(server)
//         .patch(`/api/v2/comments/${createdCommentId}`)
//         .set("Authorization", `Bearer ${otherUserAccessToken}`)
//         .send({
//           content: "해킹 시도",
//         });

//       expect(res.status).toBe(403);
//     });
//   });

//   // 댓글 삭제
//   describe("DELETE /api/v2/comments/:commentId", () => {
//     it("다른 입주민은 삭제할 수 없다 (403)", async () => {
//       const res = await request(server)
//         .delete(`/api/v2/comments/${createdCommentId}`)
//         .set("Authorization", `Bearer ${otherUserAccessToken}`);

//       expect(res.status).toBe(403);
//     });

//     it("작성자는 자신의 댓글을 삭제할 수 있다 (204)", async () => {
//       const res = await request(server)
//         .delete(`/api/v2/comments/${createdCommentId}`)
//         .set("Authorization", `Bearer ${userAccessToken}`);

//       expect(res.status).toBe(204);

//       const deleted = await prisma.comment.findUnique({
//         where: { id: createdCommentId },
//       });
//       expect(deleted).toBeNull();
//     });

//     it("관리자는 타인의 댓글도 삭제할 수 있다 (204)", async () => {
//       const tempComment = await prisma.comment.create({
//         data: {
//           content: "관리자 삭제용",
//           resourceId: noticeId,
//           resourceType: CommentResourceType.NOTICE,
//           userId: (await prisma.user.findFirst({
//             where: { username: "user1_c" },
//           }))!.id,
//         },
//       });

//       const res = await request(server)
//         .delete(`/api/v2/comments/${tempComment.id}`)
//         .set("Authorization", `Bearer ${adminAccessToken}`);

//       expect(res.status).toBe(204);
//     });
//   });
// });
