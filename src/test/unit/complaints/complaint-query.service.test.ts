import { ComplaintQueryService } from "../../../_modules/complaints/service/complaint-query.service";
import { BusinessExceptionType } from "../../../_common/exceptions/business.exception";

describe("ComplaintQueryService", () => {
  const mockRepo = {
    findById: jest.fn(),
    findList: jest.fn(),
  };

  const service = ComplaintQueryService(mockRepo as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDetail", () => {
    it("민원이 존재하면 ComplaintView를 반환한다", async () => {
      mockRepo.findById.mockResolvedValue({
        id: "c1",
        title: "소음 민원",
        content: "너무 시끄러워요",
        status: "PENDING",
        isPublic: true,
        viewsCount: 0,
        apartmentId: "a1",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "u1",
          name: "홍길동",
        },
      });

      const result = await service.getDetail({
        params: { complaintId: "c1" },
      });

      expect(result.id).toBe("c1");
      expect(result.complainant.name).toBe("홍길동");
    });

    it("민원이 없으면 NOT_FOUND 예외를 던진다", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.getDetail({ params: { complaintId: "invalid" } }),
      ).rejects.toMatchObject({
        type: BusinessExceptionType.NOT_FOUND,
      });
    });
  });

  describe("getList", () => {
    it("페이징된 목록과 메타 정보를 반환한다", async () => {
      mockRepo.findList.mockResolvedValue({
        data: [
          {
            id: "c1",
            title: "민원1",
            content: "내용",
            status: "PENDING",
            isPublic: true,
            viewsCount: 0,
            apartmentId: "a1",
            createdAt: new Date(),
            updatedAt: new Date(),
            user: { id: "u1", name: "홍길동" },
          },
        ],
        totalCount: 3,
      });

      const result = await service.getList({
        query: {
          apartmentId: "a1",
          page: 1,
          limit: 1,
        },
      });

      expect(result.data.length).toBe(1);
      expect(result.totalCount).toBe(3);
      expect(result.hasNext).toBe(true);
    });
  });
});
