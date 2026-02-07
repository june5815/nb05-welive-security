import { PrismaClient, Prisma } from "@prisma/client";
import { SSEMessage } from "./sse-types";

//  bulk save. data retention for 7d.
export class DBNotificationPersistence {
  private prisma: PrismaClient;
  private bulkSize: number;
  private pendingQueue: Array<{
    userId: string;
    model: string;
    type: string;
    data: any;
    expiresAt: Date;
  }> = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.bulkSize = parseInt(process.env.BULK_NOTIFICATION_SIZE || "100", 10);
  }

  public async savePendingNotification(
    userId: string,
    model: string,
    message: SSEMessage,
    expiryDays: number = 7,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const item = {
      userId,
      model,
      type: message.type,
      data: message.data,
      expiresAt,
    };

    this.pendingQueue.push(item);

    if (this.pendingQueue.length >= this.bulkSize) {
      await this.flushPendingQueue();
    } else {
      await this.flushPendingQueue();
    }
  }

  public async flushPendingQueue(): Promise<void> {
    if (this.pendingQueue.length === 0) {
      return;
    }

    const batch = [...this.pendingQueue];
    this.pendingQueue = [];

    try {
      const result = await this.prisma.pendingNotification.createMany({
        data: batch,
        skipDuplicates: true,
      });
    } catch (error) {
      await this.saveIndividually(batch);
    }
  }

  private async saveIndividually(
    batch: Array<{
      userId: string;
      model: string;
      type: string;
      data: any;
      expiresAt: Date;
    }>,
  ): Promise<void> {
    let successCount = 0;
    let duplicateCount = 0;

    for (const item of batch) {
      try {
        await this.prisma.pendingNotification.create({
          data: item,
        });
        successCount++;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          duplicateCount++;
        } else {
          // Log error but continue processing other items
        }
      }
    }
  }

  public async getPendingNotifications(
    userId: string,
    model?: string,
  ): Promise<SSEMessage[]> {
    try {
      const notifications = await this.prisma.pendingNotification.findMany({
        where: {
          userId,
          ...(model && { model }),
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "asc" },
      });

      return notifications.map((n) => ({
        type: n.type as any,
        model: n.model as any,
        data: n.data,
        timestamp: n.createdAt,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * 알림 삭제
   */
  public async deletePendingNotification(
    userId: string,
    model: string,
  ): Promise<void> {
    try {
      const result = await this.prisma.pendingNotification.deleteMany({
        where: {
          userId,
          model,
        },
      });

      if (result.count > 0) {
      }
    } catch (error) {
      // Handle delete errors silently
    }
  }

  public async clearPendingNotifications(userId: string): Promise<void> {
    try {
      await this.prisma.pendingNotification.deleteMany({
        where: { userId },
      });
    } catch (error) {
      // Handle clear errors silently
    }
  }

  public async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await this.prisma.pendingNotification.deleteMany({
        where: {
          expiresAt: { lte: new Date() },
        },
      });

      return result.count;
    } catch (error) {
      return 0;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.pendingQueue.length > 0) {
      await this.flushPendingQueue();
    }
  }
}
