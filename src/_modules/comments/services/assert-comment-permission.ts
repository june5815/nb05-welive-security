import { UserRole } from "@prisma/client";

export const assertCommentPermission = ({
  commentUserId,
  requestUserId,
  requestUserRole,
}: {
  commentUserId: string;
  requestUserId: string;
  requestUserRole: UserRole;
}) => {
  const isOwner = commentUserId === requestUserId;
  const isAdmin =
    requestUserRole === UserRole.ADMIN ||
    requestUserRole === UserRole.SUPER_ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error("FORBIDDEN_COMMENT_ACCESS");
  }
};
