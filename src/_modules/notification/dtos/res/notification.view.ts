export type NotificationItem = Readonly<{
  id: string;
  createdAt: string;
  content: string;
  isChecked: boolean;
}>;

export type SSENotificationResponse = Readonly<{
  type: "alarm";
  data: readonly NotificationItem[];
}>;

export type NotificationListResponse = Readonly<{
  data: readonly NotificationItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}>;

export type NotificationDetailResponse = Readonly<{
  id: string;
  createdAt: string;
  userId: string;
  isChecked: boolean;
  checkedAt: string | null;
  ishidden: boolean;
  hiddendenAt: string | null;
  event: Readonly<{
    id: string;
    type: string;
    targetType: string;
    targetId: string;
    createdAt: string;
  }>;
}>;
