import { CommentEntity } from "./comment.entity";

export const createComment = async (
  deps: {
    commentRepo: {
      create(data: {
        content: string;
        userId: string;
        noticeId: string;
      }): Promise<any>;
    };
  },
  input: {
    content: string;
    userId: string;
    noticeId: string;
  },
) => {
  const content = CommentEntity.validateContent(input.content);

  return deps.commentRepo.create({
    content,
    userId: input.userId,
    noticeId: input.noticeId,
  });
};
