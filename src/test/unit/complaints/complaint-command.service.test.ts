// import { ComplaintCommandService } from "../../../_modules/complaints/service/complaint-command.service";
// import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";
// import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";

// describe("ComplaintCommandService", () => {
//   const mockRepo = {
//     create: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//     updateStatus: jest.fn(),
//   };

//   const mockUow = {
//     doTx: jest.fn((fn) => fn()),
//   };

//   const service = ComplaintCommandService(mockRepo as any, mockUow as any);

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("create", () => {
//     it("민원을 생성한다", async () => {
//       await service.create({
//         body: {
//           title: "주차 문제",
//           content: "이중주차",
//           isPublic: true,
//         },
//         userId: "u1",
//         apartmentId: "a1",
//       });

//       expect(mockRepo.create).toHaveBeenCalled();
//       expect(mockUow.doTx).toHaveBeenCalled();
//     });
//   });

//   describe("updateStatus", () => {
//     it("민원 상태를 변경한다", async () => {
//       await service.updateStatus({
//         params: { complaintId: "c1" },
//         body: { status: ComplaintStatus.RESOLVED },
//       });

//       expect(mockRepo.updateStatus).toHaveBeenCalledWith(
//         "c1",
//         ComplaintStatus.RESOLVED,
//       );
//     });
//   });

//   describe("delete", () => {
//     it("민원을 삭제한다", async () => {
//       await service.remove({
//         params: { complaintId: "c1" },
//       });

//       expect(mockRepo.delete).toHaveBeenCalledWith("c1");
//     });
//   });
// });
