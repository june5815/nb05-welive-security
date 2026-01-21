import { PrismaClient } from "@prisma/client";
import {
  NoticeCommandRepository,
  UpdateNoticeCommand,
} from "../../../_infra/repos/notice/notice-command.repo";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";

export const updateNoticeService =
  (deps: {
    prisma: PrismaClient;
    noticeCommandRepo: NoticeCommandRepository;
  }) =>
  async (noticeId: string, command: UpdateNoticeCommand) => {
    return deps.prisma.$transaction(async (tx) => {
      return asyncContextStorage.run(tx as any, async () => {
        return deps.noticeCommandRepo.update(noticeId, command);
      });
    });
  };
