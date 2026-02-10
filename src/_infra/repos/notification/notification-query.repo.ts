import { PrismaClient, NotificationType } from "@prisma/client";
import { INotificationQueryRepo } from "../../../_common/ports/repos/notification/notification-query.repo.interface";
import { BaseQueryRepo } from "../_base/base-query.repo";
import {
  NotificationMapper,
  notificationReceiptInclude,
} from "../../mappers/notification.mapper";
import {
  Notification,
  NotificationDetail,
  NotificationListResponse,
} from "../../../_common/ports/repos/notification/notification-query.repo.interface";

export const NotificationQueryRepo = (
  prismaClient: PrismaClient,
): INotificationQueryRepo => {
  const { getPrismaClient } = BaseQueryRepo(prismaClient);

  return {
    async findUnreadNotificationSEE(userId: string): Promise<Notification[]> {
      const prisma = getPrismaClient();

      const receipts = await prisma.notificationReceipt.findMany({
        where: {
          userId,
          isChecked: false,
          isHidden: false,
        },
        include: notificationReceiptInclude,
        orderBy: { createdAt: "desc" },
      });

      return NotificationMapper.toNotifications(receipts);
    },

    async findNotificationByUserID(
      userId: string,
      page: number = 1,
      limit: number = 20,
    ): Promise<NotificationListResponse> {
      const prisma = getPrismaClient();

      const skip = (page - 1) * limit;
      //except hidden
      const where = {
        userId,
        isHidden: false,
      };

      const [receipts, total] = await Promise.all([
        prisma.notificationReceipt.findMany({
          where,
          include: notificationReceiptInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notificationReceipt.count({ where }),
      ]);

      const result = NotificationMapper.toNotificationListResponse({
        data: receipts,
        total,
        page,
        limit,
      });

      return result as NotificationListResponse;
    },
  };
};

export type NotificationQueryRepository = ReturnType<
  typeof NotificationQueryRepo
>;
