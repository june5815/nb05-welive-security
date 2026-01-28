import { PrismaClient, NoticeType } from "@prisma/client";
import { NoticeCommandRepository } from "../../../_infra/repos/notice/notice-command.repo";
import {
  CreateNoticeReqDto,
  DeleteNoticeReqDto,
  UpdateNoticeReqDto,
} from "../dtos/req/notice.request";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";

export interface INoticeCommandService {
  createNotice: (dto: CreateNoticeReqDto) => Promise<any>;
  updateNotice: (dto: UpdateNoticeReqDto) => Promise<void>;
  deleteNotice: (dto: DeleteNoticeReqDto) => Promise<void>;
}

export const NoticeCommandService = (deps: {
  prisma: PrismaClient;
  noticeCommandRepo: NoticeCommandRepository;
}): INoticeCommandService => {
  const { prisma, noticeCommandRepo } = deps;

  const createNotice = async (dto: CreateNoticeReqDto) => {
    const { userId, userApartmentId, body } = dto;

    // 트랜잭션 (중요공지사항 생성시 => 알림 )
    return prisma.$transaction(async (tx) => {
      return asyncContextStorage.run(tx as any, async () => {
        return noticeCommandRepo.create({
          title: body.title,
          content: body.content,
          category: body.category,
          type: body.isPinned ? NoticeType.IMPORTANT : NoticeType.NORMAL,
          apartmentId: userApartmentId,
          userId: userId,
          event: body.event
            ? {
                startDate: new Date(body.event.startDate),
                endDate: new Date(body.event.endDate),
              }
            : undefined,
        });

        // TODO: 알림(Notification) 발송 로직 추가 위치
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
