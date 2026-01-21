import { PrismaClient } from "@prisma/client";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";
import {
  NoticeCommandRepository,
  CreateNoticeCommand,
} from "../../../_infra/repos/notice/notice-command.repo";

export const createNoticeService =
  (deps: {
    prisma: PrismaClient;
    noticeCommandRepo: NoticeCommandRepository;
  }) =>
  async (command: CreateNoticeCommand) => {
    if (!command.event) {
      return deps.noticeCommandRepo.create(command);
    }

    // 이벤트가 있으면 공지 + 이벤트 세트로 트랜잭션
    return deps.prisma.$transaction(async (tx) => {
      return asyncContextStorage.run(tx as any, async () => {
        return deps.noticeCommandRepo.create(command);
      });
    });
  };
