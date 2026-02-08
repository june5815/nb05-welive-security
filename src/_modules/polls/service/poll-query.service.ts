export const PollQueryService = (repo: any, view: any, detailView: any) => ({
  async getList(dto: any) {
    const page = await repo.findList(dto);
    return {
      items: page.items.map(view),
      page: page.page,
      limit: page.limit,
      total: page.total,
    };
  },

  async getDetail(dto: any) {
    const poll = await repo.findDetail(dto.params.pollId, dto.user.id);
    return detailView(poll);
  },
});
