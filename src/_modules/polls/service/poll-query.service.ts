import { IPollQueryRepo } from "../ports/poll-query.repo";
import { PollView } from "../view/poll.view";
import { PollDetailView } from "../view/poll-detail.view";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const PollQueryService = (repo: IPollQueryRepo) => ({
  async getList(dto: any) {
    const page = dto.query.page ?? 1;
    const limit = dto.query.limit ?? 10;

    const { data, totalCount } = await repo.findList({
      apartmentId: dto.query.apartmentId,
      status: dto.query.status,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map(PollView.from),
      totalCount,
      hasNext: page * limit < totalCount,
    };
  },

  async getDetail(pollId: string, userId?: string) {
    const data = await repo.findDetail(pollId, userId);

    if (!data)
      throw new BusinessException({ type: BusinessExceptionType.NOT_FOUND });

    const myVote = data.votes?.[0]?.optionId;
    return PollDetailView.from(data, data.options, myVote);
  },
});
