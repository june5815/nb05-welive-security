import { CommentQueryRepository } from "../../../_infra/repos/comment/comment-query.repo";
import { GetCommentListReqDto } from "../dtos/req/comment.request";

export interface ICommentQueryService {
  getCommentList: (dto: GetCommentListReqDto) => Promise<any>;
}

export const CommentQueryService = (deps: {
  commentQueryRepo: CommentQueryRepository;
}): ICommentQueryService => {
  const { commentQueryRepo } = deps;

  return {
    getCommentList: async (dto: GetCommentListReqDto) => {
      return await commentQueryRepo.findList(dto.query);
    },
  };
};
