import { UserRole } from "@prisma/client";

export const CommentEntity = {
  validateContent(content?: string) {
    if (!content || !content.trim()) {
      throw new Error("COMMENT_CONTENT_REQUIRED");
    }
    return content.trim();
  },

  canEditOrDelete(params: { role: UserRole; userId: string; ownerId: string }) {
    return params.role === UserRole.ADMIN || params.userId === params.ownerId;
  },
};
