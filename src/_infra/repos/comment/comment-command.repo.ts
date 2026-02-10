import { PrismaClient, CommentResourceType } from "@prisma/client";
import { BaseCommandRepo } from "../_base/base-command.repo";

export interface CreateCommentCommand {
  content: string;
  resourceId: string;
  resourceType: CommentResourceType;
  userId: string;
}

export const commentCommandRepository = (prismaClient: PrismaClient) => {
  const base = BaseCommandRepo(prismaClient);

  return {
    async create(command: CreateCommentCommand) {
      const prisma = base.getPrismaClient();
      return prisma.comment.create({
        data: {
          content: command.content,
          resourceId: command.resourceId,
          resourceType: command.resourceType,
          userId: command.userId,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });
    },

    async findById(commentId: string) {
      const prisma = base.getPrismaClient();
      return prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, userId: true },
      });
    },

    async update(commentId: string, content: string) {
      const prisma = base.getPrismaClient();
      await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
    },

    async delete(commentId: string) {
      const prisma = base.getPrismaClient();
      await prisma.comment.delete({
        where: { id: commentId },
      });
    },
  };
};

export type CommentCommandRepository = ReturnType<
  typeof commentCommandRepository
>;
