export interface INotificationRepo {
  createForApartmentResidents(props: {
    apartmentId: string;
    noticeId: string;
    content: string;
  }): Promise<void>;
}
