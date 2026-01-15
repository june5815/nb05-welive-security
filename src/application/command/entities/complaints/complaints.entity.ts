import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";

export const ComplaintStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
} as const;

export type TComplaintStatus =
  (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export interface Complaint {
  readonly id?: string;
  readonly title: string;
  readonly content: string;
  readonly status?: TComplaintStatus;
  readonly isPublic: boolean;
  readonly viewsCount?: number;

  readonly userId: string;
  readonly apartmentId: string;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: number;
}

export const ComplaintEntity = {
  create(props: {
    title: string;
    content: string;
    isPublic: boolean;
    userId: string;
    apartmentId: string;
  }): Complaint {
    if (!props.title) {
      throw new BusinessException({
        type: BusinessExceptionType.COMPLAINT_TITLE_REQUIRED,
      });
    }

    if (!props.content) {
      throw new BusinessException({
        type: BusinessExceptionType.COMPLAINT_CONTENT_REQUIRED,
      });
    }

    return {
      title: props.title,
      content: props.content,
      isPublic: props.isPublic,
      status: ComplaintStatus.PENDING,
      userId: props.userId,
      apartmentId: props.apartmentId,
    };
  },

  restore(props: Complaint): Complaint {
    return { ...props };
  },

  update(
    complaint: Complaint,
    props: { title: string; content: string; isPublic: boolean },
  ): Complaint {
    if (complaint.status !== ComplaintStatus.PENDING) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    return {
      ...complaint,
      title: props.title,
      content: props.content,
      isPublic: props.isPublic,
    };
  },

  changeStatus(complaint: Complaint, status: TComplaintStatus): Complaint {
    return {
      ...complaint,
      status,
    };
  },
};
