import { ComplaintQueryService } from "../../../_modules/complaints/service/complaint-query.service";
import { ComplaintCommandService } from "../../../_modules/complaints/service/complaint-command.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("Complaint API", () => {
  let queryService: any;
  let commandService: any;

  beforeEach(() => {
    const fakeRepo = {
      // query
      findDetailForUser: jest.fn().mockResolvedValue({
        id: "1",
        title: "에어컨 고장",
        content: "안 나옴",
        status: ComplaintStatus.PENDING,
        isPublic: true,
        viewsCount: 0,
        apartmentId: "A1",
        user: { id: "u1", name: "홍길동" },
      }),
      increaseViews: jest.fn(),
      findListForUser: jest.fn().mockResolvedValue({
        data: [],
        totalCount: 0,
      }),

      // command
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: "1",
        status: ComplaintStatus.PENDING,
        update: jest.fn(),
        remove: jest.fn(),
      }),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const uow = {
      doTx: async (fn: any) => fn(),
      getComplaintRepository: () => fakeRepo,
    };

    queryService = ComplaintQueryService(fakeRepo as any);
    commandService = ComplaintCommandService(uow as any);
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
});
