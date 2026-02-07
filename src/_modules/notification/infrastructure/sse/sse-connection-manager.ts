import {
  SSEClientConnection,
  SSEMessage,
  BroadcastOptions,
  ConnectionStats,
  SSEClientMetadata,
} from "./sse-types";
import { DBNotificationPersistence } from "./db-notification-persistence";
import { PrismaClient } from "@prisma/client";

// SSE 연결 중앙 관리자

export class SSEConnectionManager {
  // userId
  private clientConnections = new Map<string, Set<SSEClientConnection>>();

  // role
  private clientsByRole = new Map<
    string,
    Map<string, Set<SSEClientConnection>>
  >();

  // apartmentId
  private clientsByApartment = new Map<string, Set<SSEClientConnection>>();

  // role2
  private clientsByRoleAndApartment = new Map<
    string,
    Map<string, Set<SSEClientConnection>>
  >();

  private connectionMetadata = new Map<string, SSEClientMetadata>();

  private persistence: DBNotificationPersistence | null = null;

  constructor(prisma?: PrismaClient) {
    if (prisma) {
      this.initializePersistentNotification(prisma);
    }
  }

  private initializePersistentNotification(prisma: PrismaClient): void {
    try {
      this.persistence = new DBNotificationPersistence(prisma);
      this.startCleanupInterval();
    } catch (error) {
      // Silently handle DB initialization errors
    }
  }

  // 만료알림 정리(every 3h)
  private startCleanupInterval(): void {
    setInterval(
      async () => {
        try {
          await this.persistence?.cleanupExpiredNotifications();
        } catch (error) {
          // Silently handle cleanup errors
        }
      },
      3 * 60 * 60 * 1000,
    );
  }

  public addClient(userId: string, connection: SSEClientConnection): void {
    if (!this.clientConnections.has(userId)) {
      this.clientConnections.set(userId, new Set());
    }
    this.clientConnections.get(userId)!.add(connection);

    const role = connection.role;
    if (!this.clientsByRole.has(role)) {
      this.clientsByRole.set(role, new Map());
    }
    const userMap = this.clientsByRole.get(role)!;
    if (!userMap.has(userId)) {
      userMap.set(userId, new Set());
    }
    userMap.get(userId)!.add(connection);

    if (connection.apartmentId) {
      if (!this.clientsByApartment.has(connection.apartmentId)) {
        this.clientsByApartment.set(connection.apartmentId, new Set());
      }
      this.clientsByApartment.get(connection.apartmentId)!.add(connection);

      if (!this.clientsByRoleAndApartment.has(role)) {
        this.clientsByRoleAndApartment.set(role, new Map());
      }
      const apartmentMap = this.clientsByRoleAndApartment.get(role)!;
      if (!apartmentMap.has(connection.apartmentId)) {
        apartmentMap.set(connection.apartmentId, new Set());
      }
      apartmentMap.get(connection.apartmentId)!.add(connection);
    }

    this.connectionMetadata.set(
      this.getConnectionKey(userId, connection.deviceId),
      {
        userId,
        deviceId: connection.deviceId,
        role: connection.role,
        connectedAt: connection.connectedAt,
        apartmentId: connection.apartmentId,
      },
    );
  }

  public removeClient(
    userId: string,
    deviceId: string,
    connection: SSEClientConnection,
  ): void {
    const userConnections = this.clientConnections.get(userId);
    if (userConnections) {
      userConnections.delete(connection);

      if (userConnections.size === 0) {
        this.clientConnections.delete(userId);
      }
    }

    const role = connection.role;
    const userMap = this.clientsByRole.get(role);
    if (userMap) {
      const connections = userMap.get(userId);
      if (connections) {
        connections.delete(connection);
        if (connections.size === 0) {
          userMap.delete(userId);
        }
        if (userMap.size === 0) {
          this.clientsByRole.delete(role);
        }
      }
    }

    if (connection.apartmentId) {
      const apartmentConnections = this.clientsByApartment.get(
        connection.apartmentId,
      );
      if (apartmentConnections) {
        apartmentConnections.delete(connection);
        if (apartmentConnections.size === 0) {
          this.clientsByApartment.delete(connection.apartmentId);
        }
      }

      const roleApartmentMap = this.clientsByRoleAndApartment.get(role);
      if (roleApartmentMap) {
        const apartmentSet = roleApartmentMap.get(connection.apartmentId);
        if (apartmentSet) {
          apartmentSet.delete(connection);
          if (apartmentSet.size === 0) {
            roleApartmentMap.delete(connection.apartmentId);
          }
          if (roleApartmentMap.size === 0) {
            this.clientsByRoleAndApartment.delete(role);
          }
        }
      }
    }

    this.connectionMetadata.delete(this.getConnectionKey(userId, deviceId));

    const remainingConnections = userConnections?.size || 0;
  }

  public sendToUser(
    userId: string,
    message: SSEMessage,
    onError?: (error: Error, deviceId: string) => void,
  ): number {
    const userConnections = this.clientConnections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      return 0;
    }

    const connectionsCopy = Array.from(userConnections);
    let sentCount = 0;

    connectionsCopy.forEach((connection) => {
      try {
        this.writeSSEMessage(connection.res, message);
        sentCount++;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (onError) {
          onError(err, connection.deviceId);
        }
      }
    });

    return sentCount;
  }

  public broadcastByRole(
    role: string,
    message: SSEMessage,
    options?: BroadcastOptions,
    onError?: (error: Error, userId: string, deviceId: string) => void,
  ): number {
    const userMap = this.clientsByRole.get(role);
    if (!userMap || userMap.size === 0) {
      return 0;
    }

    const userMapCopy = new Map(userMap);
    let sentCount = 0;

    userMapCopy.forEach((connections, userId) => {
      if (options?.excludeUserId === userId) {
        return;
      }

      const connectionsCopy = Array.from(connections);

      connectionsCopy.forEach((connection) => {
        if (options?.excludeDeviceId === connection.deviceId) {
          return;
        }

        try {
          this.writeSSEMessage(connection.res, message);
          sentCount++;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          if (onError) {
            onError(err, userId, connection.deviceId);
          }
        }
      });
    });

    return sentCount;
  }

  public broadcastAll(
    message: SSEMessage,
    options?: BroadcastOptions,
    onError?: (error: Error, userId: string, deviceId: string) => void,
  ): number {
    const connectionsCopy = new Map(this.clientConnections);
    let sentCount = 0;

    connectionsCopy.forEach((connections, userId) => {
      if (options?.excludeUserId === userId) {
        return;
      }

      const userConnectionsCopy = Array.from(connections);

      userConnectionsCopy.forEach((connection) => {
        if (options?.excludeDeviceId === connection.deviceId) {
          return;
        }

        if (
          options?.onlySendToRole &&
          options.onlySendToRole !== connection.role
        ) {
          return;
        }

        try {
          this.writeSSEMessage(connection.res, message);
          sentCount++;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(
            `[SSE Broadcast All] 전송 실패: ${userId} (${connection.deviceId})`,
            err.message,
          );
          if (onError) {
            onError(err, userId, connection.deviceId);
          }
        }
      });
    });

    return sentCount;
  }

  public broadcastToApartment(
    apartmentId: string,
    message: SSEMessage,
    options?: BroadcastOptions,
    onError?: (error: Error, userId: string, deviceId: string) => void,
  ): number {
    const connections = this.clientsByApartment.get(apartmentId);
    if (!connections || connections.size === 0) {
      return 0;
    }

    const connectionsCopy = Array.from(connections);
    let sentCount = 0;

    connectionsCopy.forEach((connection) => {
      if (
        options?.excludeDeviceId &&
        options.excludeDeviceId === connection.deviceId
      ) {
        return;
      }

      if (
        options?.onlySendToRole &&
        options.onlySendToRole !== connection.role
      ) {
        return;
      }

      try {
        this.writeSSEMessage(connection.res, message);
        sentCount++;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (onError) {
          onError(err, "", connection.deviceId);
        }
      }
    });

    return sentCount;
  }

  public broadcastByRoleAndApartment(
    role: string,
    apartmentId: string,
    message: SSEMessage,
    options?: BroadcastOptions,
    onError?: (error: Error, userId: string, deviceId: string) => void,
  ): number {
    const roleMap = this.clientsByRoleAndApartment.get(role);
    if (!roleMap) {
      return 0;
    }

    const connections = roleMap.get(apartmentId);
    if (!connections || connections.size === 0) {
      return 0;
    }

    const connectionsCopy = Array.from(connections);
    let sentCount = 0;

    connectionsCopy.forEach((connection) => {
      if (
        options?.excludeDeviceId &&
        options.excludeDeviceId === connection.deviceId
      ) {
        return;
      }

      try {
        this.writeSSEMessage(connection.res, message);
        sentCount++;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (onError) {
          onError(err, "", connection.deviceId);
        }
      }
    });

    return sentCount;
  }

  /**
   * 모든 아파트 연결이 없는(전체) 역할에게만 브로드캐스트
   * SuperAdmin은 apartmentId가 없으므로 이 메서드로 전송
   */
  public broadcastToGlobalRole(
    role: string,
    message: SSEMessage,
    options?: BroadcastOptions,
    onError?: (error: Error, userId: string, deviceId: string) => void,
  ): number {
    const userMap = this.clientsByRole.get(role);
    if (!userMap || userMap.size === 0) {
      return 0;
    }

    const userMapCopy = new Map(userMap);
    let sentCount = 0;

    userMapCopy.forEach((connections, userId) => {
      if (options?.excludeUserId === userId) {
        return;
      }

      const connectionsCopy = Array.from(connections);

      connectionsCopy.forEach((connection) => {
        if (connection.apartmentId) {
          return;
        }

        if (options?.excludeDeviceId === connection.deviceId) {
          return;
        }

        try {
          this.writeSSEMessage(connection.res, message);
          sentCount++;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(
            `[SSE Broadcast GlobalRole] 전송 실패: ${role} (${connection.deviceId})`,
            err.message,
          );
          if (onError) {
            onError(err, userId, connection.deviceId);
          }
        }
      });
    });

    return sentCount;
  }
  public isUserConnected(userId: string): boolean {
    const connections = this.clientConnections.get(userId);
    return (connections && connections.size > 0) || false;
  }

  public getConnectionCount(userId: string): number {
    return this.clientConnections.get(userId)?.size || 0;
  }

  public getRoleConnectionCount(role: string): number {
    const userMap = this.clientsByRole.get(role);
    if (!userMap) return 0;

    let totalCount = 0;
    userMap.forEach((connections) => {
      totalCount += connections.size;
    });
    return totalCount;
  }

  public getConnectionStats(): ConnectionStats {
    let totalConnections = 0;
    const connectionsByUser = new Map<string, number>();
    const connectionsByRole = new Map<string, number>();
    let oldestConnection: Date | null = null;

    this.clientConnections.forEach((connections, userId) => {
      const count = connections.size;
      connectionsByUser.set(userId, count);
      totalConnections += count;

      connections.forEach((connection) => {
        if (!oldestConnection || connection.connectedAt < oldestConnection) {
          oldestConnection = connection.connectedAt;
        }
      });
    });

    this.clientsByRole.forEach((userMap, role) => {
      let roleCount = 0;
      userMap.forEach((connections) => {
        roleCount += connections.size;
      });
      connectionsByRole.set(role, roleCount);
    });

    return {
      totalConnections,
      connectionsByUser,
      connectionsByRole,
      oldestConnection,
    };
  }

  public getAllConnections(): SSEClientMetadata[] {
    return Array.from(this.connectionMetadata.values());
  }

  public getUserConnections(userId: string): SSEClientMetadata[] {
    return Array.from(this.connectionMetadata.values()).filter(
      (m) => m.userId === userId,
    );
  }

  public getConnectionMetadata(
    userId: string,
    deviceId: string,
  ): SSEClientMetadata | undefined {
    return this.connectionMetadata.get(this.getConnectionKey(userId, deviceId));
  }

  /**
   *  미전송 알림 저장
   */
  public async savePendingNotification(
    userId: string,
    model: string,
    message: SSEMessage,
  ): Promise<void> {
    if (!this.persistence) {
      return;
    }

    try {
      await this.persistence.savePendingNotification(userId, model, message);
    } catch (error) {
      // Silently handle pending notification save errors
    }
  }

  /*  사용자의 미전송 알림 조회
   */
  public async getPendingNotifications(
    userId: string,
    model?: string,
  ): Promise<any[]> {
    if (!this.persistence) {
      return [];
    }

    try {
      return await this.persistence.getPendingNotifications(userId, model);
    } catch (error) {
      return [];
    }
  }

  public async deletePendingNotification(
    userId: string,
    model: string,
  ): Promise<void> {
    if (!this.persistence) {
      return;
    }

    try {
      await this.persistence.deletePendingNotification(userId, model);
    } catch (error) {
      console.error("[SSE] 미전송 알림 삭제 실패:", error);
    }
  }

  //사용자의 모든 미전송 알림 삭제
  public async clearPendingNotifications(userId: string): Promise<void> {
    if (!this.persistence) {
      return;
    }

    try {
      await this.persistence.clearPendingNotifications(userId);
    } catch (error) {
      console.error("[SSE] 미전송 알림 삭제 실패:", error);
    }
  }

  public async flushPendingNotifications(): Promise<void> {
    if (!this.persistence) {
      return;
    }

    try {
      await this.persistence.flushPendingQueue();
    } catch (error) {
      console.error("[SSE] 큐 저장 실패:", error);
    }
  }

  public clearAll(): void {
    this.clientConnections.forEach((connections) => {
      connections.forEach((connection) => {
        try {
          connection.res.end();
        } catch (error) {
          console.error("[SSE] 연결 종료 중 에러:", error);
        }
      });
    });

    this.clientConnections.clear();
    this.clientsByRole.clear();
    this.clientsByApartment.clear();
    this.clientsByRoleAndApartment.clear();
    this.connectionMetadata.clear();

    console.log("[SSE] 모든 연결 초기화 완료");
  }

  private writeSSEMessage(res: any, message: SSEMessage): void {
    // SSE 프로토콜: event: {type}\n data: {...}\n\n
    // ✅ 프론트가 기대하는 형식: data는 배열 또는 객체만 전송
    const eventName = message.type || "message";
    const dataToSend = JSON.stringify(message.data);
    const formattedMessage = `event: ${eventName}\ndata: ${dataToSend}\n\n`;

    const isArray = Array.isArray(message.data);
    const dataPreview =
      dataToSend.length > 150
        ? dataToSend.substring(0, 150) + "..."
        : dataToSend;

    console.log(
      `[SSE writeMessage] event=${eventName}, isArray=${isArray}, data=${dataPreview}`,
    );

    res.write(formattedMessage);
  }

  private getConnectionKey(userId: string, deviceId: string): string {
    return `${userId}:${deviceId}`;
  }
}

let instance: SSEConnectionManager | null = null;

export const getSSEConnectionManager = (
  prisma?: PrismaClient,
): SSEConnectionManager => {
  if (!instance) {
    instance = new SSEConnectionManager(prisma || ({} as PrismaClient));
  }
  return instance;
};

export const resetSSEConnectionManager = (): void => {
  instance = null;
};
