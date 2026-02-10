import { IPollQueryRepo } from "../ports/poll-query.repo";

export const PollQueryService = (repo: IPollQueryRepo) => ({
  async getList(dto: any) {
    const { user, query } = dto;
    return repo.findList({
      apartmentId: user.apartmentId,
      role: user.role,
      userId: user.id,
      page: query.page,
      limit: query.limit,
      searchKeyword: query.searchKeyword,
      status: query.status,
      building: query.building,
    });
  },

  async getDetail(dto: any) {
    const { user, params } = dto;
    return repo.findDetail({
      pollId: params.pollId,
      apartmentId: user.apartmentId,
      role: user.role,
      userId: user.id,
    });
  },
});
