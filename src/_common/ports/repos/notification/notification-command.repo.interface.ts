export interface INotificationCommandRepo {
  markAsRead: (notificationReceiptId: string, userId: string) => Promise<void>;

  createEvent: (data: {
    type: string;
    targetType: string;
    targetId: string;
    metadata?: any;
  }) => Promise<{ id: string; createdAt: Date }>;

  createReceipts: (
    data: Array<{
      userId: string;
      eventId: string;
      isChecked: boolean;
      checkedAt: null;
      isHidden: boolean;
      hiddenAt: null;
    }>,
  ) => Promise<void>;
}
