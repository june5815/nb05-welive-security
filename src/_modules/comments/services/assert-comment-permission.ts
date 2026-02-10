import { UserRole } from "@prisma/client";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

// 수정: 본인만 가능
export const assertCommentUpdatePermission = ({
  commentUserId,
  requestUserId,
}: {
  commentUserId: string;
  requestUserId: string;
}) => {
  const isOwner = commentUserId === requestUserId;
  if (!isOwner) {
    throw new BusinessException({ type: BusinessExceptionType.FORBIDDEN });
  }
};

// 삭제: 본인 또는 관리자 가능
export const assertCommentDeletePermission = ({
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
    throw new BusinessException({ type: BusinessExceptionType.FORBIDDEN });
  }
};
