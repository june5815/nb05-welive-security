import {
  noticeCommandRepository,
  UpdateNoticeCommand,
} from "../../../../outbound/repos/command/notice-command.repo";

export const updateNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (noticeId: string, command: UpdateNoticeCommand) => {
    await repo.update(noticeId, command);
  };
