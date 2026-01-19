import { Request, Response, NextFunction } from "express";

import { CreateCommentRequestSchema } from "./request/create-comment.request";
import { UpdateCommentRequestSchema } from "./request/update-comment.request";
import { createCommentService } from "../application/command/services/create-comment.service";
import { deleteCommentService } from "../application/command/services/delete-comment.service";
import { updateCommentService } from "../application/command/services/update-comment.service";
import { getCommentListQuery } from "../application/query/comment-query.service";
import { commentCommandRepository } from "../outbound/repos/command/comment-command.repo";
import { commentQueryRepository } from "../outbound/repos/query/comment-query.repo";
import { CommentResourceType } from "@prisma/client";
import { GetCommentListRequestSchema } from "./request/get-comment-list.request";

/**
 * 댓글 생성
 */
export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = CreateCommentRequestSchema.parse(req.body);

    const repo = commentCommandRepository(req.prismaClient);

    const result = await createCommentService(repo)({
      ...body,
      userId: req.user!.id,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 댓글 목록 조회
 */
export const getCommentListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repo = commentQueryRepository(req.prismaClient);
    const query = GetCommentListRequestSchema.parse(req.query);
    const result = await getCommentListQuery(repo)(query);

    res.json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 댓글 수정
 */
export const updateCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = UpdateCommentRequestSchema.parse(req.body);

    const repo = commentCommandRepository(req.prismaClient);

    await updateCommentService(repo)(req.params.commentId, body.content, {
      id: req.user!.id,
      role: req.user!.role,
    });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

/**
 * 댓글 삭제
 */
export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repo = commentCommandRepository(req.prismaClient);

    await deleteCommentService(repo)(req.params.commentId, {
      id: req.user!.id,
      role: req.user!.role,
    });

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
