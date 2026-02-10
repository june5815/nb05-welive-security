import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { ICommentQueryService } from "./services/comment-query.service";
import { ICommentCommandService } from "./services/comment-command.service";

import {
  toCommentResponse,
  toCommentListPagedResponse,
} from "../../_infra/mappers/comment.mapper";

import {
  createCommentReqSchema,
  getCommentListReqSchema,
  updateCommentReqSchema,
  deleteCommentReqSchema,
} from "./dtos/req/comment.request";

export interface ICommentController {
  createComment: (req: Request, res: Response) => Promise<void>;
  getCommentList: (req: Request, res: Response) => Promise<void>;
  updateComment: (req: Request, res: Response) => Promise<void>;
  deleteComment: (req: Request, res: Response) => Promise<void>;
}

export const CommentController = (
  baseController: IBaseController,
  commentQueryService: ICommentQueryService,
  commentCommandService: ICommentCommandService,
): ICommentController => {
  const validate = baseController.validate;

  return {
    // 댓글 생성
    createComment: async (req, res) => {
      const reqDto = validate(createCommentReqSchema, {
        body: req.body,
        userId: req.userId,
      });
      const created = await commentCommandService.createComment(reqDto);
      res.status(201).json(toCommentResponse(created));
    },

    // 댓글 목록
    getCommentList: async (req, res) => {
      const reqDto = validate(getCommentListReqSchema, {
        query: req.query,
      });
      const result = await commentQueryService.getCommentList(reqDto);
      res.status(200).json(toCommentListPagedResponse(result));
    },

    // 댓글 수정
    updateComment: async (req, res) => {
      const reqDto = validate(updateCommentReqSchema, {
        params: req.params,
        body: req.body,
        userId: req.userId,
      });
      await commentCommandService.updateComment(reqDto);
      res.status(204).end();
    },
    // 댓글 삭제
    deleteComment: async (req, res) => {
      const reqDto = validate(deleteCommentReqSchema, {
        params: req.params,
        userId: req.userId,
        role: req.userRole,
      });

      await commentCommandService.deleteComment(reqDto);
      res.status(204).end();
    },
  };
};
