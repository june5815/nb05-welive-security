import { UserRole } from "@prisma/client";
import { assertCommentPermission } from "./assert-comment-permission";
import { CommentCommandRepository } from "../../../_infra/repos/comment/comment-command.repo";

export const updateCommentService =
  (repo: CommentCommandRepository) =>
  async (
    commentId: string,
    content: string,
    user: {
      id: string;
      role: UserRole;
    },
  ) => {
    // 대ㅅ글 조회 (작성자 확인)
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

    // 수정
    await repo.update(commentId, content);
  };
