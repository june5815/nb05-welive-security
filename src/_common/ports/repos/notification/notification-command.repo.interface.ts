export interface INotificationCommandRepo {
  markAsRead: (notificationReceiptId: string, userId: string) => Promise<void>;
}
