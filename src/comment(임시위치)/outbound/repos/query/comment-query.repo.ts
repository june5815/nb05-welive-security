import { PrismaClient, CommentResourceType } from "@prisma/client";
import { BaseQueryRepo } from "../../../../outbound/repos/query/base-query.repo";

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

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          resourceId,
          resourceType,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where: {
          resourceId,
          resourceType,
        },
      }),
    ]);

    return {
      data: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: comment.user.id,
          name: comment.user.name,
        },
      })),
      totalCount,
      page,
      limit,
      hasNext: page * limit < totalCount,
    };
  };

  return {
    findList,
  };
};

export type CommentQueryRepository = ReturnType<typeof commentQueryRepository>;
