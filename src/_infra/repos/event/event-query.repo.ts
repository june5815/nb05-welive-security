import { PrismaClient } from "@prisma/client";
import { BaseQueryRepo } from "../_base/base-query.repo";

export const eventQueryRepository = (prismaClient: PrismaClient) => {
  const base = BaseQueryRepo(prismaClient);

  const findList = async ({
    apartmentId,
    year,
    month,
  }: {
    apartmentId: string;
    year: number;
    month: number;
  }) => {
    const prisma = base.getPrismaClient();

    // 해당 월의 1일 00:00:00
    const startOfMonth = new Date(year, month - 1, 1);
    // 해당 월의 마지막 날 23:59:59 (다음 달 0일)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const events = await prisma.event.findMany({
      where: {
        apartmentId,
        AND: [
          { startDate: { lte: endOfMonth } },
          { endDate: { gte: startOfMonth } },
        ],
      },
      include: {
        notice: {
          select: { category: true }, // 카테고리는 Notice에서 가져옴
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return events;
  };

  return { findList };
};

export type EventQueryRepository = ReturnType<typeof eventQueryRepository>;
