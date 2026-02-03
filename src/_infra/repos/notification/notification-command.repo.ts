import { PrismaClient } from "@prisma/client";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import { BaseCommandRepo } from "../_base/base-command.repo";
import { NotificationMapper } from "../../mappers/notification.mapper";

export const NotificationCommandRepo = (
  prismaClient: PrismaClient,
): INotificationCommandRepo => {
  const { getPrismaClient } = BaseCommandRepo(prismaClient);

  return {
    async markAsRead(notificationReceiptId: string): Promise<void> {
      const prisma = getPrismaClient();
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
