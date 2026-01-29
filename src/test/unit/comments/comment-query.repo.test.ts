import { CommentResourceType } from "@prisma/client";
import { commentQueryRepository } from "../../../_infra/repos/comment/comment-query.repo";

jest.mock("../../../_infra/repos/_base/base-query.repo", () => {
  return {
    BaseQueryRepo: jest.fn((prismaClient: any) => ({
      getPrismaClient: () => prismaClient,
    })),
  };
});

describe("Comment QueryRepository 테스트", () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      comment: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  test("findList - resourceId/Type 필터링 및 페이징 적용 확인", async () => {
    prismaMock.comment.findMany.mockResolvedValue([
      { id: "c1", content: "댓글1", user: { id: "u1", name: "홍길동" } },
    ]);
    prismaMock.comment.count.mockResolvedValue(1);

    const repo = commentQueryRepository(prismaMock);

    const result = await repo.findList({
      page: 2,
      limit: 10,
      resourceId: "notice_123",
      resourceType: "NOTICE" as CommentResourceType,
    });

    expect(prismaMock.comment.findMany).toHaveBeenCalledTimes(1);
    const args = prismaMock.comment.findMany.mock.calls[0][0];

    // where 조건 확인
    expect(args.where).toEqual({
      resourceId: "notice_123",
      resourceType: "NOTICE",
    });

    // 정렬 확인 (최신순)
    expect(args.orderBy).toEqual({ createdAt: "desc" });

    // 페이징 확인
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);

    // 작성자 정보
    expect(args.include).toEqual({
      user: { select: { id: true, name: true } },
    });

    expect(result.data).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.page).toBe(2);
  });
});
