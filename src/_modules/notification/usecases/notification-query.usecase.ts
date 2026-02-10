import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { INotificationQueryRepo } from "../../../_common/ports/repos/notification/notification-query.repo.interface";
import {
  Notification,
  NotificationDetail,
  NotificationListResponse,
} from "../../../_common/ports/repos/notification/notification-query.repo.interface";
import { GetNotificationListReq } from "../dtos/req/notification.request";

export interface INotificationQueryUsecase {
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  getNotificationList(
    req: GetNotificationListReq,
  ): Promise<NotificationListResponse>;
}

export const NotificationQueryUsecase = (
  notificationQueryRepo: INotificationQueryRepo,
): INotificationQueryUsecase => {
  const validateUserId = (userId: string): void => {
    if (!userId?.trim()) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
        error: new Error("사용자 ID는 필수입니다."),
      });
    }
  };

  const validatePage = (page: number): number => {
    if (page < 1) {
      throw new BusinessException({
        type: BusinessExceptionType.VALIDATION_ERROR,
        error: new Error("페이지는 1 이상이어야 합니다."),
      });
    }
    return Math.max(1, page);
  };

  const validateLimit = (limit: number): number => {
    if (limit < 1 || limit > 100) {
      throw new BusinessException({
        type: BusinessExceptionType.VALIDATION_ERROR,
        error: new Error("limit은 1 이상 100 이하여야 합니다."),
      });
    }
    return Math.min(Math.max(1, limit), 100);
  };

  return {
    async getUnreadNotifications(userId: string): Promise<Notification[]> {
      try {
        validateUserId(userId);
        const notifications =
          await notificationQueryRepo.findUnreadNotificationSEE(userId);
        return notifications;
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

    async getNotificationList(
      req: GetNotificationListReq,
    ): Promise<NotificationListResponse> {
      try {
        const { userId, page, limit } = req;
        validateUserId(userId);
        const validatedPage = validatePage(page);
        const validatedLimit = validateLimit(limit);

        const result = await notificationQueryRepo.findNotificationByUserID(
          userId,
          validatedPage,
          validatedLimit,
        );
        return result;
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

export type NotificationQueryService = ReturnType<
  typeof NotificationQueryUsecase
>;
