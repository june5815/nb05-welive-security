import { IPollQueryRepo } from "../ports/poll-query.repo";
import { GetPollListDto } from "../dto/poll-list.dto";
import { PollView } from "../view/poll.view";
import { PollDetailView } from "../view/poll-detail.view";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const PollQueryService = (repo: IPollQueryRepo) => ({
  async getList(dto: GetPollListDto) {
    const page = dto.query.page ?? 1;
    const limit = dto.query.limit ?? 10;

    const { data, totalCount } = await repo.findList({
      apartmentId: dto.query.apartmentId,
      status: dto.query.status,
      keyword: dto.query.keyword,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map(PollView.from),
      totalCount,
      hasNext: page * limit < totalCount,
    };
  },

  async getDetail(pollId: string) {
    const poll = await repo.findById(pollId);

    if (!poll) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
      });
    }

    return PollDetailView.from(poll);
  },
});
