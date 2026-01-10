import { ComplaintStatus, UserRole, Complaint } from "@prisma/client";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";

// 민원 생성 입력
export interface CreateComplaintInput {
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
  apartmentId: string;
}

// 민원 수정 입력
export interface UpdateComplaintInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
  status?: ComplaintStatus;
}

export const ComplaintEntity = {
  // 관리자 권한 여부
  canManage(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  },

  //민원 생성
  create(input: CreateComplaintInput) {
    if (!input.title?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.COMPLAINT_TITLE_REQUIRED,
      });
    }

    if (!input.content?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.COMPLAINT_CONTENT_REQUIRED,
      });
    }

    return {
      title: input.title.trim(),
      content: input.content,
      status: ComplaintStatus.PENDING,
      isPublic: input.isPublic,
      viewsCount: 0,
      userId: input.userId,
      apartmentId: input.apartmentId,
    };
  },

  // 민원 수정
  update(
    complaint: Pick<Complaint, "title" | "content" | "isPublic" | "status">,
    input: UpdateComplaintInput,
  ) {
    return {
      title: input.title?.trim() ?? complaint.title,
      content: input.content ?? complaint.content,
      isPublic: input.isPublic ?? complaint.isPublic,
      status: input.status ?? complaint.status,
    };
  },

  // 조회수 증가
  increaseView(viewCount: number): number {
    return viewCount + 1;
  },
};
