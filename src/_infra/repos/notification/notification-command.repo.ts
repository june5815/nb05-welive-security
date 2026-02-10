import {
  PrismaClient,
  NotificationType,
  NotificationTargetType,
} from "@prisma/client";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import { BaseCommandRepo } from "../_base/base-command.repo";
import { NotificationMapper } from "../../mappers/notification.mapper";

export const NotificationCommandRepo = (
  prismaClient: PrismaClient,
): INotificationCommandRepo => {
  const { getPrismaClient } = BaseCommandRepo(prismaClient);

  return {
    async markAsRead(
      notificationReceiptId: string,
      userId: string,
    ): Promise<void> {
      const prisma = getPrismaClient();

      const existing = await prisma.notificationReceipt.findUnique({
        where: { id: notificationReceiptId },
      });

      if (!existing) {
        throw new Error(
          `NotificationReceipt not found: ${notificationReceiptId}`,
        );
      }

      if (existing.userId !== userId) {
        throw new Error(`NotificationReceipt userId mismatch`);
      }
      await prisma.notificationReceipt.update({
        where: { id: notificationReceiptId },
        data: NotificationMapper.toMarkAsReadInput(),
      });
    },

    async createEvent(data: {
      type: string;
      targetType: string;
      targetId: string;
      metadata?: any;
    }): Promise<{ id: string; createdAt: Date }> {
      const prisma = getPrismaClient();

      const event = await prisma.notificationEvent.create({
        data: {
          type: data.type as NotificationType,
          targetType: data.targetType as NotificationTargetType,
          targetId: data.targetId,
          metadata: data.metadata,
        },
      });

      return {
        id: event.id,
        createdAt: event.createdAt,
      };
    },

    async createReceipts(
      data: Array<{
        userId: string;
        eventId: string;
        isChecked: boolean;
        checkedAt: null;
        isHidden: boolean;
        hiddenAt: null;
      }>,
    ): Promise<void> {
      const prisma = getPrismaClient();

      await prisma.notificationReceipt.createMany({
        data: data,
        skipDuplicates: true,
      });
    },
  };
};

export type NotificationCommandRepository = ReturnType<
  typeof NotificationCommandRepo
>;
