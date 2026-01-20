import {
  noticeCommandRepository,
  UpdateNoticeCommand,
} from "../../../_infra/repos/notice/notice-command.repo";

export const updateNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (noticeId: string, command: UpdateNoticeCommand) => {
    await repo.update(noticeId, command);
  };
