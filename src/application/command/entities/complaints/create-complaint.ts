import { UserRole } from "../user/user.entity";
import * as ComplaintEntity from "./complaints.entity";

import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";

import { ComplaintRepository } from "../../../ports/repos/complaint-repo.interface";
import { IUnitOfWork } from "../../../ports/unit-of-work.interface";

interface CreateComplaintInput {
  title: string;
  content: string;
  isPublic: boolean;
  apartmentId: string;
}

type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

interface AuthUser {
  id: string;
  role: UserRoleType;
}

export const createComplaint = async (
  deps: {
    complaintRepo: ComplaintRepository;
    unitOfWork: IUnitOfWork;
  },
  input: CreateComplaintInput,
  user: AuthUser,
) => {
  // 제목 검증
  if (!input.title?.trim()) {
    throw new BusinessException({
      type: BusinessExceptionType.COMPLAINT_TITLE_REQUIRED,
    });
  }

  // 내용 검증
  if (!input.content?.trim()) {
    throw new BusinessException({
      type: BusinessExceptionType.COMPLAINT_CONTENT_REQUIRED,
    });
  }

  // Entity 생성
  const complaint = ComplaintEntity.create({
    title: input.title.trim(),
    content: input.content,
    isPublic: input.isPublic,
    status: ComplaintEntity.ComplaintStatus.PENDING,
    userId: user.id,
    apartmentId: input.apartmentId,
  });

  // 트랜잭션
  return await deps.unitOfWork.execute(async () => {
    return await deps.complaintRepo.create(complaint);
  });
};
