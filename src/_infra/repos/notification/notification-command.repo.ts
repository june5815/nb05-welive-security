import { PrismaClient } from "@prisma/client";
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
  };
};

export type NotificationCommandRepository = ReturnType<
  typeof NotificationCommandRepo
>;
