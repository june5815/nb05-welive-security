import {
  PrismaClient,
  NotificationType,
  NotificationTargetType,
} from "@prisma/client";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";

export interface SendNotificationReq {
  readonly notificationType: NotificationType;
  readonly targetType: NotificationTargetType;
  readonly targetId: string;
  readonly recipientUserIds: string[];
  readonly message?: string;
}

export interface ISendNotificationUsecase {
  execute(req: SendNotificationReq): Promise<void>;
}

export const SendNotificationUsecase = (
  prismaClient: PrismaClient,
  notificationCommandRepo: INotificationCommandRepo,
): ISendNotificationUsecase => {
  const execute = async (req: SendNotificationReq): Promise<void> => {
    try {
      const notificationEvent = await prismaClient.notificationEvent.create({
        data: {
          type: req.notificationType,
          targetType: req.targetType,
          targetId: req.targetId,
          version: 1,
        },
      });

      const receipts = req.recipientUserIds.map((userId) => ({
        userId,
        eventId: notificationEvent.id,
        isChecked: false,
        checkedAt: null,
        isHidden: false,
        hiddenAt: null,
      }));

      await prismaClient.notificationReceipt.createMany({
        data: receipts,
        skipDuplicates: true,
      });
    } catch (error) {
      console.error("알림 발송 실패:", error);
      throw new BusinessException({
        type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
        message: "알림 발송에 실패했습니다.",
      });
    }
  };

  return {
    execute,
  };
};

export type SendNotificationService = ReturnType<
  typeof SendNotificationUsecase
>;
