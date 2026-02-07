import { PrismaClient } from "@prisma/client";
import { getSSEConnectionManager } from "../infrastructure/sse";
import {
  INotificationSchedulerService,
  PendingNotification,
} from "../../../_common/ports/notification/notification-scheduler-service.interface";

export const NotificationSchedulerService = (
  prismaClient: PrismaClient,
): INotificationSchedulerService => {
  const getPendingNotifications = async (): Promise<PendingNotification[]> => {
    const notifications = await prismaClient.pendingNotification.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      take: 1000,
    });

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as "alarm" | "notification" | "event",
      data: n.data,
      expiresAt: n.expiresAt,
    }));
  };

  const sendNotificationToUser = async (
    userId: string,
    notification: PendingNotification,
  ): Promise<void> => {
    const sseManager = getSSEConnectionManager();
    const userConnections = sseManager.getUserConnections(userId);

    if (userConnections && userConnections.length > 0) {
      const messageType = notification.type as
        | "alarm"
        | "notification"
        | "event";
      sseManager.sendToUser(userId, {
        type: messageType,
        data: notification.data,
        timestamp: new Date(),
      });
    }
  };

  const deletePendingNotifications = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) {
      return;
    }

    await prismaClient.pendingNotification.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  };

  const deleteExpiredNotifications = async (): Promise<void> => {
    const now = new Date();
    await prismaClient.pendingNotification.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });
  };

  return {
    getPendingNotifications,
    sendNotificationToUser,
    deletePendingNotifications,
    deleteExpiredNotifications,
  };
};
