import { Prisma } from "@prisma/client";
import { UserRole } from "../../../../_common/utils/token.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../_common/exceptions/business.exception";

export interface ComplaintDetail {
  id: string;
  title: string;
  content: string;
  status: string;
  isPublic: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    name: string;
  };
}

export const GetComplaintDetail =
  (prisma: Prisma.TransactionClient) =>
  async (props: {
    complaintId: string;
    requesterId: string;
    requesterRole: string;
  }): Promise<ComplaintDetail> => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: props.complaintId },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        isPublic: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new BusinessException({
        type: BusinessExceptionType.ARTICLE_NOT_FOUND,
      });
    }

    const isAdmin =
      props.requesterRole === UserRole.ADMIN ||
      props.requesterRole === UserRole.SUPER_ADMIN;

    const isOwner = complaint.userId === props.requesterId;

    if (!complaint.isPublic && !isAdmin && !isOwner) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    // 조회수 증가 (상세 조회 시)
    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    return {
      id: complaint.id,
      title: complaint.title,
      content: complaint.content,
      status: complaint.status,
      isPublic: complaint.isPublic,
      viewsCount: complaint.viewsCount + 1,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      user: complaint.user,
    };
  };
