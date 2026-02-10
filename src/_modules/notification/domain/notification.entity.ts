import {
  NotificationType,
  NotificationTargetType,
  NotificationEvent,
  NotificationReceipt,
} from "./notification.type";

export interface ICreateNotificationReceipt {
  (
    id: string,
    userId: string,
    eventId: string,
    createdAt?: Date,
  ): NotificationReceipt;
}

export interface IMarkAsRead {
  (receipt: NotificationReceipt): NotificationReceipt;
}

export interface IhiddeneNotification {
  (receipt: NotificationReceipt): NotificationReceipt;
}

export interface IShowNotification {
  (receipt: NotificationReceipt): NotificationReceipt;
}

export interface INotificationEntity {
  createNotificationReceipt: ICreateNotificationReceipt;
  markAsRead: IMarkAsRead;
  hiddeneNotification: IhiddeneNotification;
  showNotification: IShowNotification;
}

export const createNotificationReceipt: ICreateNotificationReceipt = (
  id: string,
  userId: string,
  eventId: string,
  createdAt: Date = new Date(),
): NotificationReceipt => ({
  id,
  userId,
  eventId,
  createdAt,
  isChecked: false,
  checkedAt: null,
  ishidden: false,
  hiddendenAt: null,
});

export const markAsRead: IMarkAsRead = (
  receipt: NotificationReceipt,
): NotificationReceipt => ({
  ...receipt,
  isChecked: true,
  checkedAt: new Date(),
});

export const hiddeneNotification: IhiddeneNotification = (
  receipt: NotificationReceipt,
): NotificationReceipt => ({
  ...receipt,
  ishidden: true,
  hiddendenAt: new Date(),
});

export const showNotification: IShowNotification = (
  receipt: NotificationReceipt,
): NotificationReceipt => ({
  ...receipt,
  ishidden: false,
  hiddendenAt: null,
});
