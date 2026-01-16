import { NoticeType } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

import { CreateNoticeRequestSchema } from "../requests/create-notice.request";
import { UpdateNoticeRequestSchema } from "../requests/update-notice.request";

import { createNoticeService } from "../../application/command/services/notice/create-notice.service";
import { updateNoticeService } from "../../application/command/services/notice/update-notice.service";
import { deleteNoticeService } from "../../application/command/services/notice/delete-notice.service";

import {
  getNoticeDetailQuery,
  getNoticeListQuery,
} from "../../application/query/services/notice-query.service";

import { noticeCommandRepository } from "../../outbound/repos/command/notice-command.repo";
import { noticeQueryRepository } from "../../outbound/repos/query/notice-query.repo";

/**
 * 공지 생성
 */
export const createNoticeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = CreateNoticeRequestSchema.parse(req.body);

    const prismaClient = req.prismaClient;
    const commandRepo = noticeCommandRepository(prismaClient);

    const result = await createNoticeService(commandRepo)({
      title: body.title,
      content: body.content,
      category: body.category,
      type: body.isPinned ? NoticeType.IMPORTANT : NoticeType.NORMAL,
      apartmentId: body.apartmentId,
      userId: req.user!.id,
      event: body.event
        ? {
            startDate: new Date(body.event.startDate),
            endDate: new Date(body.event.endDate),
          }
        : undefined,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 공지 목록 조회
 */
export const getNoticeListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prismaClient = req.prismaClient;
    const queryRepo = noticeQueryRepository(prismaClient);

    const result = await getNoticeListQuery(queryRepo)({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      apartmentId: req.user!.apartmentId,
    });

    res.json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 공지 상세 조회
 */
export const getNoticeDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prismaClient = req.prismaClient;
    const queryRepo = noticeQueryRepository(prismaClient);

    const result = await getNoticeDetailQuery(queryRepo)(req.params.noticeId);

    res.json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 공지 수정
 */
export const updateNoticeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = UpdateNoticeRequestSchema.parse(req.body);

    const commandRepo = noticeCommandRepository(req.prismaClient);

    await updateNoticeService(commandRepo)(req.params.noticeId, {
      title: body.title,
      content: body.content,
      category: body.category,
      type:
        body.isPinned !== undefined
          ? body.isPinned
            ? NoticeType.IMPORTANT
            : NoticeType.NORMAL
          : undefined,
      event: body.event
        ? {
            startDate: new Date(body.event.startDate),
            endDate: new Date(body.event.endDate),
          }
        : undefined,
    });

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

/**
 * 공지 삭제
 */
export const deleteNoticeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prismaClient = req.prismaClient;
    const commandRepo = noticeCommandRepository(prismaClient);

    await deleteNoticeService(commandRepo)(req.params.noticeId);

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
