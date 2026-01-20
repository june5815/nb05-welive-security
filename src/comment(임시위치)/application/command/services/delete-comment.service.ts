// delete-comment.service.ts
import { CommentCommandRepository } from "../../../outbound/repos/command/comment-command.repo";
import { UserRole } from "@prisma/client";
import { assertCommentPermission } from "./assert-comment-permission";

export const deleteCommentService =
  (repo: CommentCommandRepository) =>
  async (
    commentId: string,
    user: {
      id: string;
      role: UserRole;
    },
  ) => {
    // 댓글 조회
    const comment = await repo.findById(commentId);

    if (!comment) {
      throw new Error("COMMENT_NOT_FOUND");
    }

    // 권한 체크
    assertCommentPermission({
      commentUserId: comment.userId,
      requestUserId: user.id,
      requestUserRole: user.role,
    });

    // 삭제
    await repo.delete(commentId);
  };
