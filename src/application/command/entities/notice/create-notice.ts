import { NoticeCategory, UserRole } from "@prisma/client";
import { NoticeEntity } from "./notice.entity";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";
import { INoticeRepo } from "../../../ports/repos/notice-repo.interface";
import { IEventRepo } from "../../../ports/repos/event-repo.interface";
import { IUnitOfWork } from "../../../ports/unit-of-work.interface";
import { INontificationRepo } from "../../../ports/repos/notification-repo.interface";

interface CreateNoticeInput {
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned?: boolean;
  apartmentId: string;
  event?: {
    startDate: Date;
    endDate: Date;
  };
}

interface AuthUser {
  id: string;
  role: UserRole;
}

export const createNotice = async (
  deps: {
    noticeRepo: INoticeRepo;
    eventRepo: IEventRepo;
    nontificationRepo: INontificationRepo;
    unitOfWork: IUnitOfWork;
  },
  input: CreateNoticeInput,
  user: AuthUser,
) => {
  // 권한 체크
  if (!NoticeEntity.canManage(user.role)) {
    throw new BusinessException({
      type: BusinessExceptionType.FORBIDDEN,
    });
  }

  // Entity로 데이터 가공
  const noticeData = NoticeEntity.create({
    title: input.title,
    content: input.content,
    category: input.category,
    isPinned: input.isPinned,
    userId: user.id,
    apartmentId: input.apartmentId,
  });

  // 트랜잭션
  return await deps.unitOfWork.execute(async () => {
    const notice = await deps.noticeRepo.create(noticeData);

    // 이벤트 생성
    if (input.event) {
      if (input.event.startDate > input.event.endDate) {
        throw new BusinessException({
          type: BusinessExceptionType.INVALID_EVENT_DATE,
        });
      }

      await deps.eventRepo.create({
        title: notice.title,
        startDate: input.event.startDate,
        endDate: input.event.endDate,
        noticeId: notice.id,
        apartmentId: notice.apartmentId,
      });
    }

    // 알림
    await deps.nontificationRepo.createForApartmentResidents({
      apartmentId: notice.apartmentId,
      noticeId: notice.id,
      content: "새 공지사항이 등록되었습니다.",
    });

    return notice;
  });
};
