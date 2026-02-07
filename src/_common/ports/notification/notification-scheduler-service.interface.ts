export interface PendingNotification {
  id: string;
  userId: string;
  type: "alarm" | "notification" | "event";
  data: any;
  expiresAt: Date;
}

export interface INotificationSchedulerService {
  getPendingNotifications(): Promise<PendingNotification[]>;
  sendNotificationToUser(
    userId: string,
    notification: PendingNotification,
  ): Promise<void>;
  deletePendingNotifications(ids: string[]): Promise<void>;
  deleteExpiredNotifications(): Promise<void>;
}
