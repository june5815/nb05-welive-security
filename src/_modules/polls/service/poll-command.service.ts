import { IPollCommandRepo } from "../ports/poll-command.repo";
import { CreatePollDto } from "../dtos/poll-create.dto";
import { UpdatePollDto } from "../dtos/poll-update.dto";
import { VotePollDto } from "../dtos/poll-vote.dto";
import { Poll } from "../domain/poll.entity";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const PollCommandService = (repo: IPollCommandRepo) => ({
  async create(dto: CreatePollDto) {
    if (dto.user.role !== "ADMIN" && dto.user.role !== "SUPER_ADMIN")
      throw new BusinessException({ type: BusinessExceptionType.FORBIDDEN });

    const poll = Poll.create({
      apartmentId: dto.user.apartmentId,
      title: dto.body.title,
      description: dto.body.content,
      startAt: new Date(),
      endAt: new Date(dto.body.endDate),
      voterScope: { type: "ALL" },
      createdBy: dto.user.id,
    });

    await repo.save(poll);
    return poll.id;
  },

  async update(dto: UpdatePollDto) {
    const poll = await repo.findById(dto.params.pollId, "update");
    if (!poll)
      throw new BusinessException({ type: BusinessExceptionType.NOT_FOUND });
    if (!poll.canEdit())
      throw new BusinessException({ type: BusinessExceptionType.FORBIDDEN });

    const updated = new Poll(
      poll.id,
      poll.apartmentId,
      dto.body.title ?? poll.title,
      dto.body.content ?? poll.description,
      poll.status,
      poll.startAt,
      dto.body.endDate ? new Date(dto.body.endDate) : poll.endAt,
      poll.voterScope,
      poll.createdBy,
      poll.createdAt,
      new Date(),
    );

    await repo.update(updated);
  },

  async vote(dto: VotePollDto) {
    const poll = await repo.findById(dto.params.pollId, "update");
    if (!poll)
      throw new BusinessException({ type: BusinessExceptionType.NOT_FOUND });
    if (!poll.canVote())
      throw new BusinessException({ type: BusinessExceptionType.FORBIDDEN });

    await repo.vote(poll.id, dto.params.optionId, dto.user.id);
  },

  async cancelVote(dto: VotePollDto) {
    await repo.cancelVote(dto.params.pollId, dto.user.id);
  },
});
