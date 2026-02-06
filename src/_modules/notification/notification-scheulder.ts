import { PrismaClient } from "@prisma/client";
import { getSSEConnectionManager } from "./infrastructure/sse";

// 알림 스케줄러
export const createNotificationScheduler = (prismaClient: PrismaClient) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = parseInt(
    process.env.NOTIFICATION_SCHEDULER_INTERVAL_MS || "5000",
    10,
  );

  let isRunning = false;

  const start = async () => {
    if (intervalId) {
      return;
    }

    intervalId = setInterval(async () => {
      if (isRunning) {
        return;
      }

      isRunning = true;
      try {
        await executeScheduler();
      } catch (error) {
        console.error("[SSE] 실행 중 오류:", error);
      } finally {
        isRunning = false;
      }
    }, intervalMs);
  };

  const executeScheduler = async () => {
    try {
      const sseManager = getSSEConnectionManager();

      const pendingNotifications =
        await prismaClient.pendingNotification.findMany({
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          take: 1000,
        });

      if (pendingNotifications.length === 0) {
        return;
      }

      const notificationsByUser = new Map<
        string,
        typeof pendingNotifications
      >();
      for (const notification of pendingNotifications) {
        if (!notificationsByUser.has(notification.userId)) {
          notificationsByUser.set(notification.userId, []);
        }
        notificationsByUser.get(notification.userId)!.push(notification);
      }

      let broadcastCount = 0;
      for (const [userId, notifications] of notificationsByUser) {
        try {
          const userConnections = sseManager.getUserConnections(userId);

          if (userConnections && userConnections.length > 0) {
            for (const notif of notifications) {
              const messageType = notif.type as
                | "alarm"
                | "notification"
                | "event";
              sseManager.sendToUser(userId, {
                type: messageType,
                data: notif.data,
                timestamp: new Date(),
              });
            }
            broadcastCount += notifications.length;

            await prismaClient.pendingNotification.deleteMany({
              where: {
                userId,
                id: {
                  in: notifications.map((n) => n.id),
                },
              },
            });
          }
        } catch (error) {
          console.error(`[SSE] 사용자 ${userId}에게 알림 전송 실패:`, error);
        }
      }

      const now = new Date();
      const deleteResult = await prismaClient.pendingNotification.deleteMany({
        where: {
          expiresAt: {
            lte: now,
          },
        },
      });
    } catch (error) {
      console.error("[SSE] 실행 중 예외:", error);
    }
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log("SEE 중지");
    }
  };

  return { start, stop };
};
