export interface INotificationCommandRepo {
  markAsRead: (notificationReceiptId: string) => Promise<void>;
}
