import {
  PrismaClient,
  NoticeType,
  NoticeCategory,
  CommentResourceType,
} from "@prisma/client";
import { BaseCommandRepo } from "../_base/base-command.repo";

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
  const { getPrismaClient } = BaseCommandRepo(prismaClient);

  return {
    /**
     * 공지 생성
     */
    async create(command: CreateNoticeCommand) {
      const prisma = getPrismaClient();
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
      const prisma = getPrismaClient(); // tx or normal

      const notice = await prisma.notice.findUnique({
        where: { id: noticeId },
        select: { apartmentId: true },
      });
      if (!notice) throw new Error("Notice not found");

      // event 제거 요청이면 deleteMany로 안전하게
      if (command.event === null) {
        await prisma.event.deleteMany({ where: { noticeId } });
      }

      const updated = await prisma.notice.update({
        where: { id: noticeId },
        data: {
          title: command.title,
          content: command.content,
          category: command.category,
          type: command.type,
        },
      });

      // event 생성/수정이면 upsert
      if (command.event && command.event !== null) {
        await prisma.event.upsert({
          where: { noticeId },
          create: {
            title: command.title ?? updated.title,
            startDate: command.event.startDate,
            endDate: command.event.endDate,
            apartmentId: notice.apartmentId,
            noticeId,
          },
          update: {
            startDate: command.event.startDate,
            endDate: command.event.endDate,
          },
        });
      }

      return updated;
    },

    /**
     * 공지 삭제
     */
    async delete(noticeId: string) {
      const prisma = getPrismaClient(); // tx or normal

      await prisma.comment.deleteMany({
        where: {
          resourceType: CommentResourceType.NOTICE,
          resourceId: noticeId,
        },
      });

      await prisma.notice.delete({
        where: { id: noticeId },
      });
    },
  };
};

export type NoticeCommandRepository = ReturnType<
  typeof noticeCommandRepository
>;
