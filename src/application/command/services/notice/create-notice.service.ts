import { noticeCommandRepository } from "../../../../outbound/repos/command/notice-command.repo";
import { CreateNoticeCommand } from "../../entities/notice/create-notice.command";

export const createNoticeService =
  (repo: ReturnType<typeof noticeCommandRepository>) =>
  async (command: CreateNoticeCommand) => {
    return repo.create(command);
  };
