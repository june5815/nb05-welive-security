import { noticeQueryRepository } from "../../../outbound/repos/query/notice-query.repo";

export interface GetNoticeListQuery {
  page: number;
  limit: number;
  category?: string;
  searchKeyword?: string;
  apartmentId: string;
}

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
