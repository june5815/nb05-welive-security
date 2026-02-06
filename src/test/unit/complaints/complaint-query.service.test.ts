import { ComplaintQueryService } from "../../../_modules/complaints/service/complaint-query.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("ComplaintQueryService", () => {
  let service: any;

  beforeEach(() => {
    const repo = {
      findDetailForUser: async () => ({
        id: "1",
        title: "에어컨 고장",
        content: "안 나옴",
        status: ComplaintStatus.PENDING,
        isPublic: true,
        viewsCount: 0,
        apartmentId: "A1",
        user: { id: "u1", name: "홍길동" },
      }),
      increaseViews: async () => {},
      findListForUser: async () => ({
        data: [],
        totalCount: 0,
      }),
    };

    service = ComplaintQueryService(repo as any);
  });

  it("gets detail", async () => {
    const res = await service.getDetail({
      params: { complaintId: "1" },
      userId: "u1",
      role: "USER",
    });

    expect(res.title).toBe("에어컨 고장");
  });
});
