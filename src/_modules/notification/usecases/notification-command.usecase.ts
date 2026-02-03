import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import { MarkNotificationAsReadReq } from "../dtos/req/notificatio.request";

export interface INotificationCommandUsecase {
  markAsRead(req: MarkNotificationAsReadReq): Promise<void>;
}

export const NotificationCommandUsecase = (
  notificationCommandRepo: INotificationCommandRepo,
): INotificationCommandUsecase => {
  const validateUserId = (userId: string): void => {
    if (!userId?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
        error: new Error("사용자 ID는 필수입니다."),
      });
    }
  };

  const validateNotificationId = (id: string): void => {
    if (!id?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.VALIDATION_ERROR,
        error: new Error("알림 ID는 필수입니다."),
      });
    }
  };

  return {
    async markAsRead(req: MarkNotificationAsReadReq): Promise<void> {
      try {
        const { userId, notificationReceiptId } = req;
        validateUserId(userId);
        validateNotificationId(notificationReceiptId);

        // Repository 호출
        await notificationCommandRepo.markAsRead(notificationReceiptId);
      } catch (error) {
        if (error instanceof BusinessException) {
          throw error;
        }
        throw new TechnicalException({
          type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
          error: error as Error,
        });
      }
    },
  };
};

export type NotificationCommandService = ReturnType<
  typeof NotificationCommandUsecase
>;
