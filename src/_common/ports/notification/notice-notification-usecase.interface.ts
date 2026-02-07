export interface INoticeNotificationUsecase {
  notifyNewNotice(data: {
    apartmentId: string;
    noticeTitle: string;
  }): Promise<void>;
}
