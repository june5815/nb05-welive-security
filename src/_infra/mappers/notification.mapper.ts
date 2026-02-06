import { Prisma } from "@prisma/client";
import {
  NotificationReceipt,
  NotificationEvent,
} from "../../_modules/notification/domain/notification.type";

export const notificationReceiptInclude =
  Prisma.validator<Prisma.NotificationReceiptInclude>()({
    event: true,
    user: true,
  });

export type NotificationReceiptModel = Prisma.NotificationReceiptGetPayload<{
  include: typeof notificationReceiptInclude;
}>;

export const notificationEventInclude =
  Prisma.validator<Prisma.NotificationEventInclude>()({
    receipts: true,
  });

export type NotificationEventModel = Prisma.NotificationEventGetPayload<{
  include: typeof notificationEventInclude;
}>;

export interface NotificationDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly content: string;
  readonly isChecked: boolean;
}

export interface NotificationDetailDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly userId: string;
  readonly isChecked: boolean;
  readonly checkedAt: Date | null;
  readonly ishiddenden: boolean;
  readonly hiddendenAt: Date | null;
  readonly event: Readonly<{
    readonly id: string;
    readonly type: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly createdAt: Date;
  }>;
}

export interface NotificationListResponseDto {
  readonly data: NotificationDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

type ContentSource = {
  title?: string;
  content?: string;
  type?: string;
};

export const NotificationMapper = {
  toNotification(receipt: NotificationReceiptModel): NotificationDto {
    return {
      id: receipt.id,
      createdAt: receipt.createdAt,
      content: this.generateContent(receipt.event),
      isChecked: receipt.isChecked,
    };
  },

  toNotificationDetail(
    receipt: NotificationReceiptModel,
  ): NotificationDetailDto {
    return {
      id: receipt.id,
      createdAt: receipt.createdAt,
      userId: receipt.userId,
      isChecked: receipt.isChecked,
      checkedAt: receipt.checkedAt,
      ishiddenden: receipt.isHidden,
      hiddendenAt: receipt.hiddenAt,
      event: {
        id: receipt.event.id,
        type: receipt.event.type,
        targetType: receipt.event.targetType,
        targetId: receipt.event.targetId,
        createdAt: receipt.event.createdAt,
      },
    };
  },

  toNotifications(receipts: NotificationReceiptModel[]): NotificationDto[] {
    return receipts.map((receipt) => this.toNotification(receipt));
  },

  toNotificationListResponse(args: {
    data: NotificationReceiptModel[];
    total: number;
    page: number;
    limit: number;
  }): NotificationListResponseDto {
    return {
      data: this.toNotifications(args.data),
      total: args.total,
      page: args.page,
      limit: args.limit,
      hasNext: args.page * args.limit < args.total,
    };
  },

  generateContent(event: {
    type: string;
    targetType: string;
    targetId: string;
    metadata?: any;
    extraData?: { adminName?: string; userName?: string; isLogin?: boolean };
  }): string {
    const typeMessages: Record<string, string> = {
      COMPLAINT_CREATED: "새로운 민원이 접수되었습니다.",
      COMPLAINT_UPDATED: "민원이 업데이트되었습니다.",
      POLL_CREATED: "새로운 투표가 시작되었습니다.",
      POLL_ENDED: "투표가 종료되었습니다.",
      NOTICE_POSTED: "새로운 공지사항이 등록되었습니다.",
      COMMENT_ADDED: "새로운 댓글이 달렸습니다.",
      ADMIN_SIGNUP_REQUESTED: "새로운 관리자 신청이 있습니다.",
      RESIDENT_SIGNUP_REQUESTED: "새로운 입주민 신청이 있습니다.",
    };

    if (event.type === "ADMIN_SIGNUP_REQUESTED") {
      const adminName = event.metadata?.adminName || event.extraData?.adminName;
      if (adminName && event.extraData?.isLogin) {
        return `${adminName}님이 로그인하였습니다.`;
      }
      if (adminName) {
        return "새로운 관리자가 승인요청을 했습니다.";
      }
    }

    return typeMessages[event.type] || "새로운 알림이 있습니다.";
  },

  toMarkAsReadInput(): Prisma.NotificationReceiptUpdateInput {
    return {
      isChecked: true,
      checkedAt: new Date(),
    };
  },

  tohiddenNotificationInput(): Prisma.NotificationReceiptUpdateInput {
    return {
      isHidden: true,
      hiddenAt: new Date(),
    };
  },

  toShowNotificationInput(): Prisma.NotificationReceiptUpdateInput {
    return {
      isHidden: false,
      hiddenAt: null,
    };
  },
};
