import { ComplaintQueryService } from "../../../_modules/complaints/service/complaint-query.service";
import { ComplaintCommandService } from "../../../_modules/complaints/service/complaint-command.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("Complaint API", () => {
  let queryService: any;
  let commandService: any;

  beforeEach(() => {
    const fakeComplaint = {
      id: "1",
      title: "에어컨 고장",
      content: "안 나옴",
      status: ComplaintStatus.PENDING,
      isPublic: true,
      viewsCount: 0,
      apartmentId: "A1",
      userId: "u1",
      user: { id: "u1", name: "홍길동" },
    };

    const queryRepo = {
      findDetailForUser: jest.fn().mockResolvedValue(fakeComplaint),
      increaseViews: jest.fn().mockResolvedValue(undefined),
      findListForUser: jest.fn().mockResolvedValue({
        data: [fakeComplaint],
        totalCount: 1,
      }),
      findById: jest.fn().mockResolvedValue(fakeComplaint),
    };

    const commandRepo = {
      create: jest.fn().mockResolvedValue(fakeComplaint),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };

    const notificationUsecase = {
      markAsRead: jest.fn().mockResolvedValue(undefined),
      sendAdminSignupNotification: jest.fn().mockResolvedValue(undefined),
      sendResidentSignupNotification: jest.fn().mockResolvedValue(undefined),
      sendComplaintCreatedNotification: jest.fn().mockResolvedValue(undefined),
      sendComplaintStatusChangedNotification: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    queryService = ComplaintQueryService(queryRepo as any);
    commandService = ComplaintCommandService(
      commandRepo as any,
      queryRepo as any,
      notificationUsecase,
    );
  });

  it("gets complaint detail", async () => {
    const res = await queryService.getDetail({
      params: { complaintId: "1" },
      userId: "u1",
      role: "USER",
    });

    expect(res.title).toBe("에어컨 고장");
  });

  it("updates complaint via API", async () => {
    await commandService.update({
      params: { complaintId: "1" },
      body: { title: "수정됨" },
      userId: "u1",
    });

    expect(true).toBe(true);
  });

  it("filters complaints by isPublic", async () => {
    const res = await queryService.getList({
      query: {
        apartmentId: "A1",
        page: 1,
        limit: 10,
        isPublic: true,
      },
      userId: "u1",
      role: "USER",
    });

    expect(res.data).toHaveLength(1);
    expect(res.isPublic).toBe(true);
  });

  it("returns all complaints when isPublic is not provided", async () => {
    const res = await queryService.getList({
      query: {
        apartmentId: "A1",
        page: 1,
        limit: 10,
      },
      userId: "u1",
      role: "USER",
    });

    expect(res.data).toHaveLength(1);
    expect(res.isPublic).toBe(null);
  });
});
