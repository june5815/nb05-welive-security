import { PrismaClient } from "@prisma/client";
import { CommentCommandRepository } from "../../../_infra/repos/comment/comment-command.repo";
import {
  CreateCommentReqDto,
  DeleteCommentReqDto,
  UpdateCommentReqDto,
} from "../dtos/req/comment.request";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  assertCommentUpdatePermission,
  assertCommentDeletePermission,
} from "./assert-comment-permission";

export interface ICommentCommandService {
  createComment: (dto: CreateCommentReqDto) => Promise<any>;
  updateComment: (dto: UpdateCommentReqDto) => Promise<void>;
  deleteComment: (dto: DeleteCommentReqDto) => Promise<void>;
}

export const CommentCommandService = (deps: {
  prisma: PrismaClient;
  commentCommandRepo: CommentCommandRepository;
}): ICommentCommandService => {
  const { commentCommandRepo } = deps;

  const createComment = async (dto: CreateCommentReqDto) => {
    const { body, userId } = dto;

    // TODO: 알림(Notification) 로직=> 트랜잭션사용예정
    return commentCommandRepo.create({
      content: body.content,
      resourceId: body.resourceId,
      resourceType: body.resourceType,
      userId,
    });
  };

  const updateComment = async (dto: UpdateCommentReqDto) => {
    const { params, body, userId } = dto;

    const comment = await commentCommandRepo.findById(params.commentId);
    if (!comment) {
      throw new BusinessException({
        type: BusinessExceptionType.COMMENT_NOT_FOUND,
      });
    }

    assertCommentUpdatePermission({
      commentUserId: comment.userId,
      requestUserId: userId,
    });

    await commentCommandRepo.update(params.commentId, body.content);
  };

  const deleteComment = async (dto: DeleteCommentReqDto) => {
    const { params, userId, role } = dto;

    const comment = await commentCommandRepo.findById(params.commentId);
    if (!comment) {
      throw new BusinessException({
        type: BusinessExceptionType.COMMENT_NOT_FOUND,
      });
    }

    assertCommentDeletePermission({
      commentUserId: comment.userId,
      requestUserId: userId,
      requestUserRole: role as any,
    });

    await commentCommandRepo.delete(params.commentId);
  };

  return { createComment, updateComment, deleteComment };
};
