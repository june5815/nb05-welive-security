import { noticeQueryRepository } from "../../../../_infra/repos/notice/notice-query.repo";
import { GetNoticeListQuery } from "../../dtos/notice.view";

export const getNoticeListQuery =
  (repo: ReturnType<typeof noticeQueryRepository>) =>
  async (query: GetNoticeListQuery) => {
    return repo.findList(query);
  };

export const getNoticeDetailQuery =
  (repo: ReturnType<typeof noticeQueryRepository>) =>
  async (noticeId: string) => {
    return repo.findDetail(noticeId);
  };
