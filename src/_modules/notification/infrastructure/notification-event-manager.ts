import {
  PrismaClient,
  NotificationType,
  NotificationTargetType,
} from "@prisma/client";
import { getSSEConnectionManager } from "../infrastructure/sse";
import { NotificationMapper } from "../../../_infra/mappers/notification.mapper";
import { randomUUID } from "crypto";
import { INotificationEventManager } from "../../../_common/ports/notification/notification-event-manager.interface";

export const NotificationEventManager = (
  prisma: PrismaClient,
): INotificationEventManager => {
  const createEvent = async (data: {
    type: string;
    targetType: string;
    targetId: string;
    metadata: any;
  }) => {
    return await prisma.notificationEvent.create({
      data: {
        type: data.type as NotificationType,
        targetType: data.targetType as NotificationTargetType,
        targetId: data.targetId,
        metadata: data.metadata,
      },
    });
  };

  const findResidents = async (apartmentId: string) => {
    return await prisma.user.findMany({
      where: {
        role: "USER",
        resident: {
          household: {
            apartmentId: apartmentId,
          },
        },
      },
    });
  };

  const createReceipts = async (
    receipts: Array<{
      id: string;
      userId: string;
      eventId: string;
      isChecked: boolean;
      checkedAt: null;
      isHidden: boolean;
    }>,
  ) => {
    await Promise.all(
      receipts.map((receipt) =>
        prisma.notificationReceipt.create({
          data: receipt,
        }),
      ),
    );
  };

  const broadcastAndSaveNotification = async (data: {
    role: string;
    apartmentId: string;
    message: any;
    noticeTitle: string;
  }) => {
    const sseManager = getSSEConnectionManager();
    const notificationReceiptId = randomUUID();
    const createdAt = new Date().toISOString();
    const notificationEventType = "NOTICE_CREATED";

    const content = NotificationMapper.generateContent({
      type: notificationEventType,
      targetType: "APARTMENT",
      targetId: data.apartmentId,
      extraData: {},
    });

    const notificationData = [
      {
        id: notificationReceiptId,
        createdAt: createdAt,
        content: content,
        isChecked: false,
      },
    ];

    const sseMessage: any = {
      type: "alarm",
      model: "notice",
      data: notificationData,
      timestamp: new Date(),
    };

    sseManager.broadcastByRoleAndApartment(
      data.role,
      data.apartmentId,
      sseMessage,
    );

    const dbMessage: any = {
      type: "alarm",
      model: "notice",
      data: notificationData[0],
      timestamp: new Date(),
    };

    await sseManager.savePendingNotification(
      data.apartmentId,
      "notice",
      dbMessage,
    );
  };

  return {
    createEvent,
    findResidents,
    createReceipts,
    broadcastAndSaveNotification,
  };
};
