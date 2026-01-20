import {
  noticeCommandRepository,
  CreateNoticeCommand,
} from "../../../_infra/repos/notice/notice-command.repo";

export const createNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (command: CreateNoticeCommand) => {
    return repo.create(command);
  };
