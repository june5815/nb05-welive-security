import { ComplaintCommandService } from "../../../_modules/complaints/service/complaint-command.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("ComplaintCommandService", () => {
  let service: any;
  let commandRepo: any;
  let queryRepo: any;
  let notificationUsecase: any;
  let fakeComplaint: any;

  beforeEach(() => {
    fakeComplaint = {
      id: "1",
      title: "에어컨 고장",
      content: "안 나옴",
      status: ComplaintStatus.PENDING,
      isPublic: true,
      userId: "u1",
      apartmentId: "A1",
    };

    commandRepo = {
      create: jest.fn().mockResolvedValue(fakeComplaint),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };

    queryRepo = {
      findById: jest.fn().mockResolvedValue(fakeComplaint),
      increaseViews: jest.fn().mockResolvedValue(undefined),
      findDetailForUser: jest.fn().mockResolvedValue(fakeComplaint),
      findListForUser: jest.fn().mockResolvedValue({
        data: [fakeComplaint],
        totalCount: 1,
      }),
    };

    // Notification Mock
    notificationUsecase = {
      sendComplaintCreatedNotification: jest.fn().mockResolvedValue(undefined),
      sendComplaintStatusChangedNotification: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    service = ComplaintCommandService(
      commandRepo,
      queryRepo,
      notificationUsecase,
    );
  });

  it("creates a complaint and sends notification", async () => {
    await service.create({
      body: {
        title: "에어컨 고장",
        content: "안 나옴",
        isPublic: true,
        apartmentId: "A1",
      },
      userId: "u1",
    });

    expect(commandRepo.create).toHaveBeenCalled();
    expect(
      notificationUsecase.sendComplaintCreatedNotification,
    ).toHaveBeenCalledWith({
      apartmentId: "A1",
      complaintTitle: "에어컨 고장",
      residentName: "u1",
    });
  });

  it("updates a complaint", async () => {
    await service.update({
      params: { complaintId: "1" },
      body: { title: "수정된 제목", content: "수정된 내용" },
      userId: "u1",
    });

    expect(queryRepo.findById).toHaveBeenCalledWith("1");
    expect(commandRepo.update).toHaveBeenCalled();
  });

  it("removes a complaint", async () => {
    await service.remove({
      params: { complaintId: "1" },
      userId: "u1",
    });

    expect(queryRepo.findById).toHaveBeenCalledWith("1");
    expect(commandRepo.delete).toHaveBeenCalledWith("1");
  });

  it("updates status and sends notification to resident", async () => {
    await service.updateStatus({
      params: { complaintId: "1" },
      body: { status: ComplaintStatus.IN_PROGRESS },
      userId: "u1",
    });

    expect(queryRepo.findById).toHaveBeenCalledWith("1");
    expect(commandRepo.updateStatus).toHaveBeenCalledWith(
      "1",
      ComplaintStatus.IN_PROGRESS,
    );
    expect(
      notificationUsecase.sendComplaintStatusChangedNotification,
    ).toHaveBeenCalledWith({
      complaintId: "1",
      complaintTitle: "에어컨 고장",
      residentId: "u1",
      newStatus: ComplaintStatus.IN_PROGRESS,
    });
  });
});
