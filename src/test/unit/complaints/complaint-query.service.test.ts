import { ComplaintQueryService } from "../../../_modules/complaints/service/complaint-query.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("ComplaintQueryService", () => {
  let service: any;
  let queryRepo: any;
  let fakeComplaint: any;

  beforeEach(() => {
    fakeComplaint = {
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

    queryRepo = {
      findDetailForUser: jest.fn().mockResolvedValue(fakeComplaint),
      increaseViews: jest.fn().mockResolvedValue(undefined),
      findListForUser: jest.fn().mockResolvedValue({
        data: [fakeComplaint],
        totalCount: 1,
      }),
      findById: jest.fn().mockResolvedValue(fakeComplaint),
    };

    service = ComplaintQueryService(queryRepo);
  });

  it("gets detail with user relationship", async () => {
    const res = await service.getDetail({
      params: { complaintId: "1" },
      userId: "u1",
      apartmentId: "A1",
      role: "USER",
    });

    expect(res.title).toBe("에어컨 고장");
    expect(res.complainant).toBeDefined();
    expect(res.complainant.name).toBe("홍길동");
    expect(queryRepo.increaseViews).toHaveBeenCalledWith("1");
  });

  it("gets list of complaints with status filter", async () => {
    const res = await service.getList({
      query: {
        apartmentId: "A1",
        page: 1,
        limit: 10,
        status: ComplaintStatus.PENDING,
      },
      userId: "u1",
      role: "USER",
    });

    expect(res.data).toHaveLength(1);
    expect(res.totalCount).toBe(1);
    expect(res.data[0].title).toBe("에어컨 고장");
    expect(queryRepo.findListForUser).toHaveBeenCalledWith({
      apartmentId: "A1",
      requesterId: "u1",
      isAdmin: false,
      page: 1,
      limit: 10,
      status: ComplaintStatus.PENDING,
    });
  });

  it("gets list without status filter (all statuses)", async () => {
    const res = await service.getList({
      query: {
        apartmentId: "A1",
        page: 1,
        limit: 10,
        status: undefined,
      },
      userId: "u1",
      role: "USER",
    });

    expect(res.data).toHaveLength(1);
    expect(res.status).toBeNull();
    expect(queryRepo.findListForUser).toHaveBeenCalledWith({
      apartmentId: "A1",
      requesterId: "u1",
      isAdmin: false,
      page: 1,
      limit: 10,
      status: undefined,
    });
  });

  it("includes pagination info in list response", async () => {
    const res = await service.getList({
      query: {
        apartmentId: "A1",
        page: 1,
        limit: 10,
        status: null,
      },
      userId: "u1",
      role: "USER",
    });

    expect(res.page).toBe(1);
    expect(res.limit).toBe(10);
    expect(res.hasNext).toBe(false);
  });
});
