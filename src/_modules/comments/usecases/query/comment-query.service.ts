import { CommentResourceType } from "@prisma/client";
import { CommentQueryRepository } from "../../../../_infra/repos/comment/comment-query.repo";

export const getCommentListQuery =
  (repo: CommentQueryRepository) =>
  async ({
    page,
    limit,
    resourceId,
    resourceType,
  }: {
    page: number;
    limit: number;
    resourceId: string;
    resourceType: CommentResourceType;
  }) => {
    return repo.findList({
      page,
      limit,
      resourceId,
      resourceType,
    });
  };
