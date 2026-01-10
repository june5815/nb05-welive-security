import { NoticeCategory, UserRole } from "@prisma/client";
import { NoticeEntity } from "./notice.entity";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";
import { INoticeRepo } from "../../../ports/repos/notice-repo.interface";
import { IEventRepo } from "../../../ports/repos/event-repo.interface";
import { IUnitOfWork } from "../../../ports/unit-of-work.interface";

interface UpdateNoticeInput {
  noticeId: string;

  title?: string;
  content?: string;
  category?: NoticeCategory;
  isPinned?: boolean;

  /**
   * - event === undefined : 이벤트 건드리지 않음(유지)
   * - event === null      : 이벤트 삭제
   * - event 객체          : 이벤트 생성/수정
   */
  event?: {
    startDate: Date;
    endDate: Date;
  } | null;
}

interface AuthUser {
  id: string;
  role: UserRole;
}

export const updateNotice = async (
  deps: {
    noticeRepo: INoticeRepo;
    eventRepo: IEventRepo;
    unitOfWork: IUnitOfWork;
  },
  input: UpdateNoticeInput,
  user: AuthUser,
) => {
  //권한 체크
  if (!NoticeEntity.canManage(user.role)) {
    throw new BusinessException({
      type: BusinessExceptionType.FORBIDDEN,
    });
  }

  //기존 공지 조회
  const existing = await deps.noticeRepo.findById(input.noticeId);
  if (!existing) {
    throw new BusinessException({
      type: BusinessExceptionType.NOTICE_NOT_FOUND,
    });
  }

  //entity로 업데이트 데이터 가공 (PATCH 의미 유지)
  const noticeUpdateData = NoticeEntity.update(
    {
      title: existing.title,
      content: existing.content,
      category: existing.category,
      type: existing.type,
    },
    {
      title: input.title,
      content: input.content,
      category: input.category,
      isPinned: input.isPinned,
    },
  );

  // 트랜잭션으로 공지 + 이벤트 같이 처리
  return await deps.unitOfWork.execute(async () => {
    //공지 업데이트
    const updatedNotice = await deps.noticeRepo.updateById(
      input.noticeId,
      noticeUpdateData,
    );

    // 이벤트 처리
    // - undefined: 유지
    if (input.event !== undefined) {
      // - null: 삭제
      if (input.event === null) {
        await deps.eventRepo.deleteByNoticeId(input.noticeId);
      } else {
        // - object: upsert (없으면 create, 있으면 update)
        const { startDate, endDate } = input.event;
        if (startDate > endDate) {
          throw new BusinessException({
            type: BusinessExceptionType.INVALID_EVENT_DATE,
          });
        }

        const existingEvent = await deps.eventRepo.findByNoticeId(
          input.noticeId,
        );

        if (!existingEvent) {
          await deps.eventRepo.create({
            title: updatedNotice.title,
            startDate,
            endDate,
            noticeId: updatedNotice.id,
            apartmentId: updatedNotice.apartmentId,
          });
        } else {
          await deps.eventRepo.updateById(existingEvent.id, {
            title: updatedNotice.title, // 공지 제목 바뀌면 이벤트 제목도 동기화
            startDate,
            endDate,
          });
        }
      }
    }

    return updatedNotice;
  });
};
