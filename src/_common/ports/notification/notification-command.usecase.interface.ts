export interface INotificationCommandUsecase {
  sendAdminSignupNotification: (data: { adminName: string }) => Promise<void>;

  sendResidentSignupNotification: (data: {
    apartmentId: string;
    userName: string;
    building: number;
    unit: number;
  }) => Promise<void>;
}
