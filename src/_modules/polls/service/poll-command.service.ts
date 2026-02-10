import { IPollCommandRepo } from "../ports/poll-command.repo";

export const PollCommandService = (repo: IPollCommandRepo) => ({
  async create(dto: any) {
    const { user, body } = dto;
    const id = await repo.createPoll({
      title: body.title,
      content: body.content,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      apartmentId: body.apartmentId ?? user.apartmentId,
      building: body.building,
      userId: user.id,
      options: body.options,
    });

    return {
      id,
      createdAt: new Date(),
      title: body.title,
      content: body.content,
      status: "PENDING",
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      apartmentId: body.apartmentId ?? user.apartmentId,
      building: body.building ?? 0,
      author: { id: user.id, name: user.name ?? "" },
    };
  },

  async update(dto: any) {
    const { params, body } = dto;
    await repo.updatePoll({
      pollId: params.pollId,
      title: body.title,
      content: body.content,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      building: body.building,
      options: body.options,
    });
  },

  async delete(dto: any) {
    await repo.deletePoll(dto.params.pollId);
  },

  async vote(dto: any) {
    const { user, params } = dto;
    await repo.vote({
      pollId: params.pollId,
      optionId: params.optionId,
      userId: user.id,
    });
  },

  async cancelVote(dto: any) {
    const { user, params } = dto;
    await repo.cancelVote({ pollId: params.pollId, userId: user.id });
  },
});
