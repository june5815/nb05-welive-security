export const PollCommandService = (repo: any, queryRepo: any) => ({
  async create({ user, body }: any) {
    const pollId = await repo.createPoll({
      ...body,
      authorId: user.id,
      apartmentId: user.apartmentId,
    });

    return queryRepo.findDetail(pollId, user.id);
  },

  async update({ params, body }: any) {
    await repo.updatePoll(params.pollId, body);
  },

  async delete(pollId: string) {
    await repo.deletePoll(pollId);
  },

  async vote({ params, user }: any) {
    await repo.vote(params.pollId, params.optionId, user.id);
  },

  async cancelVote({ params, user }: any) {
    await repo.cancelVote(params.pollId, params.optionId, user.id);
  },
});
