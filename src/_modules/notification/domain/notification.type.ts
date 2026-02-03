export enum NotificationType {
  COMPLAINT_CREATED = "COMPLAINT_CREATED",
  COMPLAINT_UPDATED = "COMPLAINT_UPDATED",
  POLL_CREATED = "POLL_CREATED",
  POLL_ENDED = "POLL_ENDED",
  NOTICE_POSTED = "NOTICE_POSTED",
  COMMENT_ADDED = "COMMENT_ADDED",
}

export enum NotificationTargetType {
  COMPLAINT = "COMPLAINT",
  POLL = "POLL",
  NOTICE = "NOTICE",
  COMMENT = "COMMENT",
}

export type NotificationEvent = Readonly<{
  id: string;
  type: NotificationType;
  createdAt: Date;
  version: number;
  targetType: NotificationTargetType;
  targetId: string;
}>;

export type NotificationReceipt = Readonly<{
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  isChecked: boolean;
  checkedAt: Date | null;
  ishidden: boolean;
  hiddendenAt: Date | null;
}>;
