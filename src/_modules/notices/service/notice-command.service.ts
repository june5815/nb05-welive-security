import { PrismaClient, NoticeType } from "@prisma/client";
import { NoticeCommandRepository } from "../../../_infra/repos/notice/notice-command.repo";
import {
  CreateNoticeBodyDto,
  DeleteNoticeReqDto,
  UpdateNoticeReqDto,
} from "../dtos/req/notice.request";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";
import { getSSEConnectionManager } from "../../notification/infrastructure/sse";
import { NotificationMapper } from "../../../_infra/mappers/notification.mapper";
import { randomUUID } from "crypto";

export interface INoticeCommandService {
  createNotice: (dto: {
    userId: string;
    apartmentId: string;
    body: CreateNoticeBodyDto;
  }) => Promise<any>;

  updateNotice: (dto: UpdateNoticeReqDto) => Promise<void>;
  deleteNotice: (dto: DeleteNoticeReqDto) => Promise<void>;
}

export const NoticeCommandService = (deps: {
  prisma: PrismaClient;
  noticeCommandRepo: NoticeCommandRepository;
}): INoticeCommandService => {
  const { prisma, noticeCommandRepo } = deps;

  const createNotice = async (dto: {
    userId: string;
    apartmentId: string;
    body: CreateNoticeBodyDto;
  }) => {
    const { userId, apartmentId, body } = dto;

    return prisma.$transaction(async (tx) => {
      return asyncContextStorage.run(tx as any, async () => {
        //알림으로 인해 변경
        const notice = await noticeCommandRepo.create({
          title: body.title,
          content: body.content,
          category: body.category,
          type: body.isPinned ? NoticeType.IMPORTANT : NoticeType.NORMAL,
          apartmentId,
          userId,
          event: body.event
            ? {
                startDate: new Date(body.event.startDate),
                endDate: new Date(body.event.endDate),
              }
            : undefined,
        });

        // 알림 로직
        try {
          const sseManager = getSSEConnectionManager();
          const notificationReceiptId = randomUUID();
          const createdAt = new Date().toISOString();
          const notificationEventType = "NOTICE_CREATED";

          const content = NotificationMapper.generateContent({
            type: notificationEventType,
            targetType: "APARTMENT",
            targetId: apartmentId,
            extraData: {},
          });

          const notificationData = [
            {
              id: notificationReceiptId,
              createdAt: createdAt,
              content: content,
              isChecked: false,
            },
          ];

          const sseMessage: any = {
            type: "alarm",
            model: "notice",
            data: notificationData,
            timestamp: new Date(),
          };

          sseManager.broadcastByRoleAndApartment(
            "USER",
            apartmentId,
            sseMessage,
          );

          const notificationEvent = await prisma.notificationEvent.create({
            data: {
              type: notificationEventType,
              targetType: "APARTMENT",
              targetId: apartmentId,
              metadata: {
                noticeTitle: notice.title,
              },
            },
          });

          const residents = await prisma.user.findMany({
            where: {
              role: "USER",
              resident: {
                household: {
                  apartmentId: apartmentId,
                },
              },
            },
          });

          if (residents && notificationEvent) {
            await Promise.all(
              residents.map((resident: any) =>
                prisma.notificationReceipt.create({
                  data: {
                    id: randomUUID(),
                    userId: resident.id,
                    eventId: notificationEvent.id,
                    isChecked: false,
                    checkedAt: null,
                    isHidden: false,
                  },
                }),
              ),
            );
          }

          const dbMessage: any = {
            type: "alarm",
            model: "notice",
            data: notificationData[0],
            timestamp: new Date(),
          };

          await sseManager.savePendingNotification(
            apartmentId,
            "notice",
            dbMessage,
          );
        } catch (notificationError) {}

        return notice;
      });
    });
  };

  const updateNotice = async (dto: UpdateNoticeReqDto) => {
    const { params, body } = dto;

    await prisma.$transaction(async (tx) => {
      await asyncContextStorage.run(tx as any, async () => {
        await noticeCommandRepo.update(params.noticeId, {
          title: body.title,
          content: body.content,
          category: body.category,
          type:
            body.isPinned !== undefined
              ? body.isPinned
                ? NoticeType.IMPORTANT
                : NoticeType.NORMAL
              : undefined,
          event:
            body.event === null
              ? null
              : body.event
                ? {
                    startDate: new Date(body.event.startDate),
                    endDate: new Date(body.event.endDate),
                  }
                : undefined,
        });
      });
    });
  };

  const deleteNotice = async (dto: DeleteNoticeReqDto) => {
    const { params } = dto;

    await prisma.$transaction(async (tx) => {
      await asyncContextStorage.run(tx as any, async () => {
        await noticeCommandRepo.delete(params.noticeId);
      });
    });
  };

  return {
    createNotice,
    updateNotice,
    deleteNotice,
  };
};
