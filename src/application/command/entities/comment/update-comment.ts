import { CommentEntity } from "./comment.entity";

export const updateComment = async (
  deps: {
    commentRepo: {
      findById(id: string): Promise<{
        id: string;
        userId: string;
        content: string;
      } | null>;
      update(params: { id: string; content: string }): Promise<void>;
    };
  },
  input: {
    commentId: string;
    content: string;
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

  const content = CommentEntity.validateContent(input.content);

  await deps.commentRepo.update({
    id: comment.id,
    content,
  });
};
