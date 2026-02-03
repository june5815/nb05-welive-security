export interface Notification {
  readonly id: string;
  readonly createdAt: Date;
  readonly content: string;
  readonly isChecked: boolean;
}

export interface NotificationDetail {
  readonly id: string;
  readonly createdAt: Date;
  readonly userId: string;
  readonly isChecked: boolean;
  readonly checkedAt: Date | null;
  readonly isHidden: boolean;
  readonly event: {
    readonly id: string;
    readonly type: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly createdAt: Date;
  };
}

export interface SSENotifiactionResponse {
  readonly type: "alarm";
  readonly data: Notification[];
}

export interface NotificationListResponse {
  readonly data: Notification[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

export interface INotificationQueryRepo {
  /**
   * 읽지않은 알림 조회 (SSE용)
   * GET /api/v2/notifications/sse
   */
  findUnreadNotificationSEE: (userId: string) => Promise<Notification[]>;

  /**
   * 알림목록 조회 (페이징)
   * GET /api/v2/notifications
   */
  findNotificationByUserID: (
    userId: string,
    page?: number,
    limit?: number,
  ) => Promise<NotificationListResponse>;
}
