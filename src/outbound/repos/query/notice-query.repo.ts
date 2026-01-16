import { PrismaClient } from "@prisma/client";
import { BaseQueryRepo } from "./base-query.repo";

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

    const [items, total] = await Promise.all([
      prisma.notice.findMany({
        where: { apartmentId },
        orderBy: [
          { type: "desc" }, // IMPORTANT 먼저
          { createdAt: "desc" }, // 최신순
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          type: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      prisma.notice.count({
        where: { apartmentId },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  };

  const findDetail = async (noticeId: string) => {
    const prisma = base.getPrismaClient();

    return prisma.notice.findUnique({
      where: { id: noticeId },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  };

  return {
    findList,
    findDetail,
  };
};
