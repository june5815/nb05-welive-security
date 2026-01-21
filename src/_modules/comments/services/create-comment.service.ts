import { CommentCommandRepository } from "../../../_infra/repos/comment/comment-command.repo";
import { CommentEntity } from "../domain/comment.entity";

export const createCommentService =
  (repo: CommentCommandRepository) => async (entity: CommentEntity) => {
    return repo.create(entity);
  };
