import { CommentCommandRepository } from "../../../outbound/repos/command/comment-command.repo";
import { CommentEntity } from "../entity/comment.entity";

export const createCommentService =
  (repo: CommentCommandRepository) => async (entity: CommentEntity) => {
    return repo.create(entity);
  };
