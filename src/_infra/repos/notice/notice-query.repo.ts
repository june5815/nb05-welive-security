import { CommentResourceType, PrismaClient } from "@prisma/client";
import { BaseQueryRepo } from "../_base/base-query.repo";

export const noticeQueryRepository = (prismaClient: PrismaClient) => {
  const base = BaseQueryRepo(prismaClient);

  const findList = async ({
    page,
    limit,
    apartmentId,
  }: {
    page: number;
    limit: number;
    apartmentId: string;
  }) => {
    const prisma = base.getPrismaClient();

    // 공지 목록
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where: { apartmentId },
        orderBy: [{ type: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notice.count({ where: { apartmentId } }),
    ]);

    // 댓글 수 집계
    const noticeIds = notices.map((n) => n.id);

    const commentCounts = await prisma.comment.groupBy({
      by: ["resourceId"],
      where: {
        resourceType: CommentResourceType.NOTICE,
        resourceId: { in: noticeIds },
      },
      _count: {
        _all: true,
      },
    });

    const countMap = Object.fromEntries(
      commentCounts.map((c) => [c.resourceId, c._count._all]),
    );

    // 합치기
    const items = notices.map((notice) => ({
      ...notice,
      commentCount: countMap[notice.id] ?? 0,
    }));

    return {
      items,
      total,
      page,
      limit,
    };
  };

  const findDetail = async (noticeId: string) => {
    const prisma = base.getPrismaClient();

    const [notice, commentCount] = await Promise.all([
      prisma.notice.findUnique({
        where: { id: noticeId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          event: true,
        },
      }),
      prisma.comment.count({
        where: {
          resourceType: CommentResourceType.NOTICE,
          resourceId: noticeId,
        },
      }),
    ]);

    if (!notice) return null;

    return {
      ...notice,
      commentCount,
    };
  };

  return {
    findList,
    findDetail,
  };
};
