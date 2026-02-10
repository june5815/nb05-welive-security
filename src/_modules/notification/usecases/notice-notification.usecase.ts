import { randomUUID } from "crypto";
import { INoticeNotificationUsecase } from "../../../_common/ports/notification/notice-notification-usecase.interface";
import { INotificationEventManager } from "../../../_common/ports/notification/notification-event-manager.interface";

export const NoticeNotificationUsecase = (
  notificationEventManager: INotificationEventManager,
): INoticeNotificationUsecase => {
  const notifyNewNotice = async (data: {
    apartmentId: string;
    noticeTitle: string;
  }): Promise<void> => {
    const { apartmentId, noticeTitle } = data;

    try {
      const notificationEventType = "NOTICE_CREATED";

      const sseMessage: any = {
        type: "alarm",
        model: "notice",
        data: {
          content: noticeTitle,
          isChecked: false,
        },
        timestamp: new Date(),
      };

      await notificationEventManager.broadcastAndSaveNotification({
        role: "USER",
        apartmentId,
        message: sseMessage,
        noticeTitle,
      });

      const notificationEvent = await notificationEventManager.createEvent({
        type: notificationEventType,
        targetType: "APARTMENT",
        targetId: apartmentId,
        metadata: {
          noticeTitle,
        },
      });

      const residents =
        await notificationEventManager.findResidents(apartmentId);

      if (residents && notificationEvent) {
        const receipts = residents.map((resident: any) => ({
          id: randomUUID(),
          userId: resident.id,
          eventId: notificationEvent.id,
          isChecked: false,
          checkedAt: null,
          isHidden: false,
        }));

        await notificationEventManager.createReceipts(receipts);
      }
    } catch (notificationError) {}
  };

  return {
    notifyNewNotice,
  };
};
