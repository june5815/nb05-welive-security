import { EventQueryService } from "../../../_modules/events/service/event-query.service";

describe("Event QueryService 테스트", () => {
  const mockRepo = {
    findList: jest.fn(),
  };

  const service = EventQueryService({ eventQueryRepo: mockRepo });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getEventList 매핑 및 호출", async () => {
    const mockDBData = [
      {
        id: "event1",
        startDate: new Date("2023-2-15T00:00:00Z"),
        endDate: new Date("2023-2-16T23:59:59Z"),
        noticeId: "n1",
        apartmentId: "apt1",
        title: "긴급 점검",
        resourceType: "NOTICE",
        notice: { category: "EMERGENCY" },
      },
    ];

    mockRepo.findList.mockResolvedValue(mockDBData);

    const dto = {
      query: {
        apartmentId: "apt1",
        year: 2023,
        month: 2,
      },
    };

    const res = await service.getEventList(dto);

    expect(mockRepo.findList).toHaveBeenCalledWith({
      apartmentId: "apt1",
      year: 2023,
      month: 2,
    });

    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      id: "event1",
      category: "EMERGENCY",
      resourceId: "n1",
      apartmentId: "apt1",
      title: "긴급 점검",
      resourceType: "NOTICE",
    });
  });
});
