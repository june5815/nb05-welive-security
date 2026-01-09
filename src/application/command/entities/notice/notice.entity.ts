import { NoticeCategory, NoticeType, UserRole, Notice } from "@prisma/client";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";

export interface CreateNoticeInput {
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned?: boolean;
  userId: string;
  apartmentId: string;
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  category?: NoticeCategory;
  isPinned?: boolean;
}

export const NoticeEntity = {
  canManage(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  },

  create(input: CreateNoticeInput) {
    if (!input.title?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.NOTICE_TITLE_REQUIRED,
      });
    }

    if (!input.content?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.NOTICE_CONTENT_REQUIRED,
      });
    }

    return {
      title: input.title.trim(),
      content: input.content,
      category: input.category,
      type: input.isPinned ? NoticeType.IMPORTANT : NoticeType.NORMAL,
      userId: input.userId,
      apartmentId: input.apartmentId,
    };
  },

  update(
    notice: Pick<Notice, "title" | "content" | "category" | "type">,
    input: UpdateNoticeInput,
  ) {
    return {
      title: input.title?.trim() ?? notice.title,
      content: input.content ?? notice.content,
      category: input.category ?? notice.category,
      type:
        input.isPinned === undefined
          ? notice.type
          : input.isPinned
            ? NoticeType.IMPORTANT
            : NoticeType.NORMAL,
    };
  },

  increaseView(viewCount: number): number {
    return viewCount + 1;
  },
};
