import { PrismaClient } from "@prisma/client";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";
import { NoticeCommandRepository } from "../../../_infra/repos/notice/notice-command.repo";

export const deleteNoticeService =
  (deps: {
    prisma: PrismaClient;
    noticeCommandRepo: NoticeCommandRepository;
  }) =>
  async (noticeId: string) => {
    return deps.prisma.$transaction(async (tx) => {
      return asyncContextStorage.run(tx as any, async () => {
        await deps.noticeCommandRepo.delete(noticeId);
      });
    });
  };
