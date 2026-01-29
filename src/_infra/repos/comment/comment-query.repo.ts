import { CommentResourceType, PrismaClient } from "@prisma/client";
import { BaseQueryRepo } from "../_base/base-query.repo";

export const commentQueryRepository = (prismaClient: PrismaClient) => {
  const base = BaseQueryRepo(prismaClient);

  const findList = async ({
    page,
    limit,
    resourceId,
    resourceType,
  }: {
    page: number;
    limit: number;
    resourceId: string;
    resourceType: CommentResourceType;
  }) => {
    const prisma = base.getPrismaClient();

    const where = { resourceType, resourceId };

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const hasNext = page * limit < totalCount;

    return {
      data: comments,
      totalCount,
      page,
      limit,
      hasNext,
    };
  };

  return { findList };
};

export type CommentQueryRepository = ReturnType<typeof commentQueryRepository>;
