export interface INotificationEventManager {
  createEvent(data: {
    type: string;
    targetType: string;
    targetId: string;
    metadata: any;
  }): Promise<any>;

  findResidents(apartmentId: string): Promise<any[]>;

  createReceipts(
    receipts: Array<{
      id: string;
      userId: string;
      eventId: string;
      isChecked: boolean;
      checkedAt: null;
      isHidden: boolean;
    }>,
  ): Promise<void>;

  broadcastAndSaveNotification(data: {
    role: string;
    apartmentId: string;
    message: any;
    noticeTitle: string;
  }): Promise<void>;
}
