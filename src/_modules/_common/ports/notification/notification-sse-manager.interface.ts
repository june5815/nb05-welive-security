import { Response } from "express";

export interface SSEClientConnection {
  deviceId: string;
  res: Response;
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

export interface INotificationSSEManager {
  addClient(userId: string, connection: SSEClientConnection): void;
  removeClient(
    userId: string,
    deviceId: string,
    connection: SSEClientConnection,
  ): void;
  getPendingNotifications(userId: string): Promise<Array<{ data: unknown }>>;
  sendToUser(userId: string, data: SSEMessage): void;
}
