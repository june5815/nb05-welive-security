import {
  CommentResourceType,
  NoticeCategory,
  PrismaClient,
  Prisma,
} from "@prisma/client";
import { BaseQueryRepo } from "../_base/base-query.repo";

export const noticeQueryRepository = (prismaClient: PrismaClient) => {
  const base = BaseQueryRepo(prismaClient);

  const findList = async ({
    page,
    limit,
    apartmentId,
    category,
    searchKeyword,
  }: {
    page: number;
    limit: number;
    apartmentId: string;
    category?: NoticeCategory;
    searchKeyword?: string;
  }) => {
    const prisma = base.getPrismaClient();

    const keyword = searchKeyword?.trim();
    const where = {
      apartmentId,
      ...(category ? { category } : {}),
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: "insensitive" as const } },
              { content: { contains: keyword, mode: "insensitive" as const } },
              {
                user: {
                  name: { contains: keyword, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const [notices, totalCount] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ type: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.notice.count({ where }),
    ]);

    const noticeIds = notices.map((n) => n.id);

    const commentCounts =
      noticeIds.length === 0
        ? []
        : await prisma.comment.groupBy({
            by: ["resourceId"],
            where: {
              resourceType: CommentResourceType.NOTICE,
              resourceId: { in: noticeIds },
            },
            _count: { _all: true },
          });

    const countMap = Object.fromEntries(
      commentCounts.map((c) => [c.resourceId, c._count._all]),
    );

    const data = notices.map((notice) => ({
      ...notice,
      commentCount: countMap[notice.id] ?? 0,
    }));

    const hasNext = page * limit < totalCount;

    return { data, totalCount, page, limit, hasNext };
  };

  const findDetail = async (noticeId: string) => {
    const prisma = base.getPrismaClient();

    try {
      const [notice, commentCount] = await Promise.all([
        prisma.notice.update({
          where: { id: noticeId },
          data: { viewCount: { increment: 1 } },
          include: {
            user: { select: { id: true, name: true } },
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

      return { ...notice, commentCount };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }
      throw error;
    }
  };

  const findApartmentIdByAdminId = async (
    adminId: string,
  ): Promise<string | null> => {
    const prisma = base.getPrismaClient();

    const apt = await prisma.apartment.findUnique({
      where: { adminId },
      select: { id: true },
    });

    return apt?.id ?? null;
  };

  return {
    findList,
    findDetail,
    findApartmentIdByAdminId,
  };
};
