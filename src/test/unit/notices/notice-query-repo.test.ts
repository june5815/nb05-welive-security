import { CommentResourceType } from "@prisma/client";
import { noticeQueryRepository } from "../../../_infra/repos/notice/notice-query.repo";

jest.mock("../../../_infra/repos/_base/base-query.repo", () => {
  return {
    BaseQueryRepo: jest.fn((prismaClient: any) => ({
      getPrismaClient: () => prismaClient,
    })),
  };
});

describe("공지사항queryRepo 테스트", () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      notice: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      comment: {
        groupBy: jest.fn(),
        count: jest.fn(),
      },
    };

    jest.clearAllMocks();
  });

  test("findList - category 필터가 where에 반영", async () => {
    prismaMock.notice.findMany.mockResolvedValue([
      {
        id: "n1",
        apartmentId: "apt_1",
        type: "IMPORTANT",
      },
    ]);
    prismaMock.notice.count.mockResolvedValue(1);

    prismaMock.comment.groupBy.mockResolvedValue([
      { resourceId: "n1", _count: { _all: 2 } },
    ]);

    const repo = noticeQueryRepository(prismaMock);

    const result = await repo.findList({
      page: 1,
      limit: 20,
      apartmentId: "apt_1",
      category: "MAINTENANCE" as any,
    } as any);

    expect(prismaMock.notice.findMany).toHaveBeenCalledTimes(1);
    const findManyArgs = prismaMock.notice.findMany.mock.calls[0][0];

    expect(findManyArgs.where).toEqual(
      expect.objectContaining({
        apartmentId: "apt_1",
        category: "MAINTENANCE",
      }),
    );
    expect(result.data[0].commentCount).toBe(2);
  });

  test("findList - searchKeyword가 제목/내용/작성자 검색으로 반영", async () => {
    prismaMock.notice.findMany.mockResolvedValue([
      { id: "n1", apartmentId: "apt_1", type: "IMPORTANT" },
    ]);
    prismaMock.notice.count.mockResolvedValue(1);
    prismaMock.comment.groupBy.mockResolvedValue([
      { resourceId: "n1", _count: { _all: 0 } },
    ]);

    const repo = noticeQueryRepository(prismaMock);

    await repo.findList({
      page: 1,
      limit: 20,
      apartmentId: "apt_1",
      searchKeyword: "홍길동",
    } as any);

    const findManyArgs = prismaMock.notice.findMany.mock.calls[0][0];

    expect(findManyArgs.where).toEqual(
      expect.objectContaining({
        apartmentId: "apt_1",
        OR: expect.any(Array),
      }),
    );

    const or = findManyArgs.where.OR;

    expect(or).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.objectContaining({
            contains: "홍길동",
          }),
        }),
      ]),
    );

    expect(or).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.objectContaining({
            contains: "홍길동",
          }),
        }),
      ]),
    );

    expect(or).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user: expect.objectContaining({
            name: expect.objectContaining({
              contains: "홍길동",
            }),
          }),
        }),
      ]),
    );
  });

  test("findList - 정렬(type desc, createdAt desc) + 페이징(skip/take)이 적용", async () => {
    prismaMock.notice.findMany.mockResolvedValue([]);
    prismaMock.notice.count.mockResolvedValue(0);
    prismaMock.comment.groupBy.mockResolvedValue([]);

    const repo = noticeQueryRepository(prismaMock);

    await repo.findList({
      page: 2,
      limit: 10,
      apartmentId: "apt_1",
    } as any);

    const findManyArgs = prismaMock.notice.findMany.mock.calls[0][0];

    expect(findManyArgs.orderBy).toEqual([
      { type: "desc" },
      { createdAt: "desc" },
    ]);
    expect(findManyArgs.skip).toBe(10);
    expect(findManyArgs.take).toBe(10);
  });

  test("findDetail - 조회수 증가(update increment) + include(user,event)로 가져오기", async () => {
    prismaMock.notice.update.mockResolvedValue({
      id: "n1",
      viewCount: 11,
      user: { id: "u1", name: "관리자" },
      event: null,
    });
    prismaMock.comment.count.mockResolvedValue(5);

    const repo = noticeQueryRepository(prismaMock);

    const result = await repo.findDetail("n1");

    expect(prismaMock.notice.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.notice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "n1" },
        data: { viewCount: { increment: 1 } },
        include: expect.objectContaining({
          user: { select: { id: true, name: true } },
          event: true,
        }),
      }),
    );

    expect(prismaMock.comment.count).toHaveBeenCalledWith({
      where: {
        resourceType: CommentResourceType.NOTICE,
        resourceId: "n1",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "n1",
        commentCount: 5,
      }),
    );
  });
});
