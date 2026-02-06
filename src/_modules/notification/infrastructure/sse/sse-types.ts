/**
 * SSE 클라이언트 연결 정보
 *
 * @property deviceId - 고유 디바이스 식별자 (UUID 또는 user-agent 기반)
 * @property res - Express Response 객체 (SSE 스트림)
 * @property role - 사용자 역할 (ADMIN, USER, SUPER_ADMIN)
 * @property connectedAt - 연결 시간
 * @property apartmentId - (선택) 아파트 ID (아파트별 필터링용)
 */
export type SSEClientConnection = {
  readonly deviceId: string;
  readonly res: any;
  readonly role: string;
  readonly connectedAt: Date;
  readonly apartmentId?: string;
};

export interface SSEClientMetadata {
  userId: string;
  deviceId: string;
  role: string;
  connectedAt: Date;
  apartmentId?: string;
}

export interface SSEMessage {
  type: "alarm" | "notification" | "event";
  model?: "notice" | "poll" | "complaint" | "comment" | "request";
  data: any;
  missed?: boolean;
  timestamp?: Date;
}

export interface BroadcastOptions {
  excludeUserId?: string;
  excludeDeviceId?: string;
  onlySendToRole?: string;
  apartmentId?: string;
  excludeApartmentId?: string;
  model?: "notice" | "poll" | "complaint" | "comment" | "request";
}

export interface ConnectionStats {
  totalConnections: number;
  connectionsByUser: Map<string, number>;
  connectionsByRole: Map<string, number>;
  oldestConnection: Date | null;
}
