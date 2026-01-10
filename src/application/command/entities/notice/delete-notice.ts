import { UserRole } from "@prisma/client";
import { NoticeEntity } from "./notice.entity";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";
import { INoticeRepo } from "../../../ports/repos/notice-repo.interface";
import { IEventRepo } from "../../../ports/repos/event-repo.interface";
import { IUnitOfWork } from "../../../ports/unit-of-work.interface";

interface DeleteNoticeInput {
  noticeId: string;
}

interface AuthUser {
  id: string;
  role: UserRole;
}

export const deleteNotice = async (
  deps: {
    noticeRepo: INoticeRepo;
    eventRepo: IEventRepo;
    unitOfWork: IUnitOfWork;
  },
  input: DeleteNoticeInput,
  user: AuthUser,
) => {
  //권한 체크 (관리자만)
  if (!NoticeEntity.canManage(user.role)) {
    throw new BusinessException({
      type: BusinessExceptionType.FORBIDDEN,
    });
  }

  //존재 확인
  const existing = await deps.noticeRepo.findById(input.noticeId);
  if (!existing) {
    throw new BusinessException({
      type: BusinessExceptionType.NOTICE_NOT_FOUND,
    });
  }

  //트랜잭션으로 삭제
  await deps.unitOfWork.execute(async () => {
    /**
     * Event는 Notice 삭제 시 Cascade로 삭제되지만, repository 구현에 따라 cascade가 보장되지 않을 수 있어서
     * 안전하게 먼저 지우는 방식으로 작성.
     */
    await deps.eventRepo.deleteByNoticeId(input.noticeId);

    /**
     * Notice 삭제
     */
    await deps.noticeRepo.deleteById(input.noticeId);
  });

  return;
};
