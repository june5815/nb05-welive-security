import { CommentEntity } from "./comment.entity";

export const deleteComment = async (
  deps: {
    commentRepo: {
      findById(id: string): Promise<{
        id: string;
        userId: string;
      } | null>;
      delete(id: string): Promise<void>;
    };
  },
  input: {
    commentId: string;
    userId: string;
    role: any;
  },
) => {
  const comment = await deps.commentRepo.findById(input.commentId);
  if (!comment) throw new Error("COMMENT_NOT_FOUND");

  if (
    !CommentEntity.canEditOrDelete({
      role: input.role,
      userId: input.userId,
      ownerId: comment.userId,
    })
  ) {
    throw new Error("UNAUTHORIZED");
  }

  await deps.commentRepo.delete(comment.id);
};
