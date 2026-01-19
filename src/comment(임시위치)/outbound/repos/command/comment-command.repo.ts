import { PrismaClient, CommentResourceType } from "@prisma/client";
import { BaseCommandRepo } from "../../../../outbound/repos/command/base-command.repo";

export interface CreateCommentCommand {
  content: string;
  resourceId: string;
  resourceType: CommentResourceType;
  userId: string;
}

export const commentCommandRepository = (prismaClient: PrismaClient) => {
  const base = BaseCommandRepo(prismaClient);
  const prisma = base.getPrismaClient();

  return {
    /**
     * 댓글 생성
     */
    async create(command: CreateCommentCommand) {
      return prisma.comment.create({
        data: {
          content: command.content,
          resourceId: command.resourceId,
          resourceType: command.resourceType,
          userId: command.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    },

    /**
     * 댓글 단건 조회 (권한 체크용)
     */
    async findById(commentId: string) {
      return prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          userId: true,
        },
      });
    },

    /**
     * 댓글 수정
     */
    async update(commentId: string, content: string) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
    },

    /**
     * 댓글 삭제
     */
    async delete(commentId: string) {
      await prisma.comment.delete({
        where: { id: commentId },
      });
    },
  };
};

export type CommentCommandRepository = ReturnType<
  typeof commentCommandRepository
>;
