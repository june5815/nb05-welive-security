import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import { IUserQueryRepo } from "../../../_common/ports/repos/user/user-query-repo.interface";
import { MarkNotificationAsReadReq } from "../dtos/req/notification.request";

export interface INotificationCommandUsecase {
  markAsRead(req: MarkNotificationAsReadReq): Promise<void>;
  sendAdminSignupNotification: (data: { adminName: string }) => Promise<void>;
  sendResidentSignupNotification: (data: {
    apartmentId: string;
    userName: string;
    building: number;
    unit: number;
  }) => Promise<void>;
}

export const NotificationCommandUsecase = (
  notificationCommandRepo: INotificationCommandRepo,
  userQueryRepo?: IUserQueryRepo,
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

  const sendAdminSignupNotification = async (data: {
    adminName: string;
  }): Promise<void> => {
    try {
      if (!userQueryRepo) {
        return;
      }

      const superAdmins = await userQueryRepo.findAllSuperAdmins();

      if (!superAdmins || superAdmins.length === 0) {
        return;
      }

      const notificationEvent = await notificationCommandRepo.createEvent({
        type: "ADMIN_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "SYSTEM",
        metadata: {
          adminName: data.adminName,
        },
      });
      const receipts = superAdmins.map((superAdmin) => ({
        userId: superAdmin.id,
        eventId: notificationEvent.id,
        isChecked: false,
        checkedAt: null,
        isHidden: false,
        hiddenAt: null,
      }));

      await notificationCommandRepo.createReceipts(receipts);
    } catch (error) {
      console.error("Admin signup notification error:", error);
    }
  };

  const sendResidentSignupNotification = async (data: {
    apartmentId: string;
    userName: string;
    building: number;
    unit: number;
  }): Promise<void> => {
    try {
      if (!userQueryRepo) {
        return;
      }

      const apartment = await userQueryRepo.findApartmentById(data.apartmentId);

      if (!apartment || !apartment.admin?.id) {
        return;
      }

      const notificationEvent = await notificationCommandRepo.createEvent({
        type: "RESIDENT_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: data.apartmentId,
        metadata: {
          userName: data.userName,
          building: data.building,
          unit: data.unit,
        },
      });

      const receipt = {
        userId: apartment.admin.id,
        eventId: notificationEvent.id,
        isChecked: false,
        checkedAt: null,
        isHidden: false,
        hiddenAt: null,
      };

      await notificationCommandRepo.createReceipts([receipt]);
    } catch (error) {
      console.error("Resident signup notification error:", error);
    }
  };

  return {
    async markAsRead(req: MarkNotificationAsReadReq): Promise<void> {
      try {
        const { userId, notificationReceiptId } = req;
        validateUserId(userId);
        validateNotificationId(notificationReceiptId);

        // Repository 호출
        await notificationCommandRepo.markAsRead(notificationReceiptId, userId);
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
    sendAdminSignupNotification,
    sendResidentSignupNotification,
  };
};

export type NotificationCommandService = ReturnType<
  typeof NotificationCommandUsecase
>;
