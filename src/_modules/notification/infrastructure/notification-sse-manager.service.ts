import { PrismaClient } from "@prisma/client";
import {
  INotificationSSEManager,
  SSEClientConnection,
  SSEMessage,
} from "../../_common/ports/notification/notification-sse-manager.interface";
import { getSSEConnectionManager } from "./sse";

export const NotificationSSEManagerService = (
  prisma: PrismaClient,
): INotificationSSEManager => {
  const sseManager = getSSEConnectionManager(prisma);

  return {
    addClient: (userId: string, connection: SSEClientConnection): void => {
      sseManager.addClient(userId, connection);
    },
    removeClient: (
      userId: string,
      deviceId: string,
      connection: SSEClientConnection,
    ): void => {
      sseManager.removeClient(userId, deviceId, connection);
    },
    getPendingNotifications: async (userId: string) => {
      return await sseManager.getPendingNotifications(userId);
    },
    sendToUser: (userId: string, data: SSEMessage): void => {
      sseManager.sendToUser(userId, data);
    },
  };
};
