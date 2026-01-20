import { PrismaClient, NoticeType, NoticeCategory } from "@prisma/client";
import { BaseCommandRepo } from "../../../_infra/repo/base/base-command.repo";

export interface CreateNoticeCommand {
  title: string;
  content: string;
  category: NoticeCategory;
  type: NoticeType;
  apartmentId: string;
  userId: string;
  event?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface UpdateNoticeCommand {
  title?: string;
  content?: string;
  category?: NoticeCategory;
  type?: NoticeType;
  event?: {
    startDate: Date;
    endDate: Date;
  } | null;
}

export const noticeCommandRepository = (prismaClient: PrismaClient) => {
  const baseRepo = BaseCommandRepo(prismaClient);
  const prisma = baseRepo.getPrismaClient();

  return {
    /**
     * 공지 생성
     */
    async create(command: CreateNoticeCommand) {
      return prisma.notice.create({
        data: {
          title: command.title,
          content: command.content,
          category: command.category,
          type: command.type,
          apartmentId: command.apartmentId,
          userId: command.userId,
          event: command.event
            ? {
                create: {
                  title: command.title,
                  startDate: command.event.startDate,
                  endDate: command.event.endDate,
                  apartmentId: command.apartmentId,
                },
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    },

    /**
     * 공지 수정
     */
    async update(noticeId: string, command: UpdateNoticeCommand) {
      // 1. apartmentId 먼저 조회 (비동기 로직 분리)
      const notice = await prisma.notice.findUnique({
        where: { id: noticeId },
        select: { apartmentId: true },
      });

      if (!notice) {
        throw new Error("Notice not found");
      }

      return prisma.notice.update({
        where: { id: noticeId },
        data: {
          title: command.title,
          content: command.content,
          category: command.category,
          type: command.type,

          event:
            command.event === undefined
              ? undefined
              : command.event === null
                ? { delete: true }
                : {
                    upsert: {
                      create: {
                        title: command.title ?? "",
                        startDate: command.event.startDate,
                        endDate: command.event.endDate,
                        apartmentId: notice.apartmentId,
                      },
                      update: {
                        startDate: command.event.startDate,
                        endDate: command.event.endDate,
                      },
                    },
                  },
        },
      });
    },

    /**
     * 공지 삭제
     */
    async delete(noticeId: string) {
      return prisma.notice.delete({
        where: { id: noticeId },
      });
    },
  };
};

export type NoticeCommandRepository = ReturnType<
  typeof noticeCommandRepository
>;
