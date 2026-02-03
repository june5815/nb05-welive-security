import { PrismaClient, NoticeType } from "@prisma/client";
import { NoticeCommandRepository } from "../../../_infra/repos/notice/notice-command.repo";
import {
  CreateNoticeBodyDto,
  DeleteNoticeReqDto,
  UpdateNoticeReqDto,
} from "../dtos/req/notice.request";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";

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
        return noticeCommandRepo.create({
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
        // todo
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
