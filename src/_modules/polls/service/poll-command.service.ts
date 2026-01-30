import { IPollCommandRepo } from "../ports/poll-command.repo";
import { CreatePollDto } from "../dto/poll-create.dto";
import { VotePollDto } from "../dto/poll-vote.dto";
import { Poll } from "../domain/poll.entity";

export const PollCommandService = (repo: IPollCommandRepo) => ({
  async create(dto: CreatePollDto) {
    const poll = Poll.create({
      apartmentId: dto.apartmentId,
      title: dto.body.title,
      description: dto.body.description,
      startAt: new Date(dto.body.startAt),
      endAt: new Date(dto.body.endAt),
      voterScope: dto.body.voterScope,
      createdBy: dto.userId,
    });

    const options = dto.body.options.map((o) => ({
      id: crypto.randomUUID(),
      text: o.text,
    }));

    await repo.create(poll, options);
  },

  async vote(dto: VotePollDto) {
    await repo.vote(dto.params.pollId, dto.params.optionId, dto.userId);
  },

  async cancelVote(dto: VotePollDto) {
    await repo.cancelVote(dto.params.pollId, dto.userId);
  },

  async remove(pollId: string) {
    await repo.delete(pollId);
  },
});
