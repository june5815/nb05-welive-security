import { noticeCommandRepository } from "../../../_infra/repos/notice/notice-command.repo";

export const deleteNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (noticeId: string) => {
    await repo.delete(noticeId);
  };
