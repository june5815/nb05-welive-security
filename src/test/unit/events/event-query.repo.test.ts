jest.mock("../../../_infra/repos/_base/base-query.repo", () => {
  return {
    BaseQueryRepo: jest.fn((prismaClient: any) => ({
      getPrismaClient: () => prismaClient,
    })),
  };
});

import { eventQueryRepository } from "../../../_infra/repos/event/event-query.repo";

describe("Event QueryRepository 테스트", () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      event: {
        findMany: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  test("findList - apartmentId, year, month로 기간 조회 및 notice 포함", async () => {
    const mockEvent = {
      id: "event1",
      startDate: new Date("2023-01-10T00:00:00Z"),
      endDate: new Date("2023-01-15T23:59:59Z"),
      noticeId: "notice1",
      apartmentId: "apt1",
      notice: { category: "MAINTENANCE" },
      resourceType: "NOTICE",
      title: "점검 안내",
    };

    prismaMock.event.findMany.mockResolvedValue([mockEvent]);

    const repo = eventQueryRepository(prismaMock);

    const result = await repo.findList({
      apartmentId: "apt1",
      year: 2023,
      month: 1,
    });

    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1);

    const callArgs = prismaMock.event.findMany.mock.calls[0][0];
    expect(callArgs.where.apartmentId).toBe("apt1");

    expect(callArgs.include).toHaveProperty("notice");
    expect(callArgs.include.notice).toHaveProperty("select");
    expect(callArgs.include.notice.select).toHaveProperty("category", true);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("event1");
  });
});
