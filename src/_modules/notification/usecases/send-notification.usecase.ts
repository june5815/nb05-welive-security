import { NotificationType, NotificationTargetType } from "@prisma/client";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
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
  notificationCommandRepo: INotificationCommandRepo,
): ISendNotificationUsecase => {
  const execute = async (req: SendNotificationReq): Promise<void> => {
    try {
      const notificationEvent = await notificationCommandRepo.createEvent({
        type: req.notificationType,
        targetType: req.targetType,
        targetId: req.targetId,
      });

      // 수신자별
      const receipts = req.recipientUserIds.map((userId) => ({
        userId,
        eventId: notificationEvent.id,
        isChecked: false,
        checkedAt: null,
        isHidden: false,
        hiddenAt: null,
      }));

      await notificationCommandRepo.createReceipts(receipts);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
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
