import { noticeCommandRepository } from "../../../../outbound/repos/command/notice-command.repo";

export const deleteNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (noticeId: string) => {
    await repo.delete(noticeId);
  };
