export interface INontificationRepo {
  createForApartmentResidents(props: {
    apartmentId: string;
    noticeId: string;
    content: string;
  }): Promise<void>;
}
