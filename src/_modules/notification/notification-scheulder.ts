import { INotificationSchedulerService } from "../../_common/ports/notification/notification-scheduler-service.interface";
export const createNotificationScheduler = (
  notificationSchedulerService: INotificationSchedulerService,
) => {
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
      const pendingNotifications =
        await notificationSchedulerService.getPendingNotifications();

      if (pendingNotifications.length === 0) {
        return;
      }

      // 사용자별로 알림 그룹화
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

      // 사용자별로 알림 전송
      const sentNotificationIds: string[] = [];
      for (const [userId, notifications] of notificationsByUser) {
        try {
          for (const notif of notifications) {
            await notificationSchedulerService.sendNotificationToUser(
              userId,
              notif,
            );
            sentNotificationIds.push(notif.id);
          }
        } catch (error) {
          console.error(`[SSE] 사용자 ${userId}에게 알림 전송 실패:`, error);
        }
      }

      if (sentNotificationIds.length > 0) {
        await notificationSchedulerService.deletePendingNotifications(
          sentNotificationIds,
        );
      }

      await notificationSchedulerService.deleteExpiredNotifications();
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
