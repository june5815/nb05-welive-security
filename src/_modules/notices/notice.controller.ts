import { NoticeType } from "@prisma/client";
import { Request, Response, NextFunction, RequestHandler } from "express";

import { CreateNoticeRequestSchema } from "../../_modules/notices/dtos/create-notice.request";
import { UpdateNoticeRequestSchema } from "../../_modules/notices/dtos/update-notice.request";

import { createNoticeService } from "../../_modules/notices/service/create-notice.service";
import { updateNoticeService } from "../../_modules/notices/service/update-notice.service";
import { deleteNoticeService } from "../../_modules/notices/service/delete-notice.service";

import {
  getNoticeListQuery,
  getNoticeDetailQuery,
} from "./usecases/query/notice-query.service";

import { noticeCommandRepository } from "../../_infra/repos/notice/notice-command.repo";
import { noticeQueryRepository } from "../../_infra/repos/notice/notice-query.repo";

import {
  toNoticeListPagedResponse,
  toNoticeResponse,
} from "../../_infra/mappers/notice.mapper";

export const NoticeController = (): INoticeController => {
  return {
    createNotice: createNoticeController,
    getNoticeList: getNoticeListController,
    getNoticeDetail: getNoticeDetailController,
    updateNotice: updateNoticeController,
    deleteNotice: deleteNoticeController,
  };
};

export interface INoticeController {
  createNotice: RequestHandler;
  getNoticeList: RequestHandler;
  getNoticeDetail: RequestHandler;
  updateNotice: RequestHandler;
  deleteNotice: RequestHandler;
}

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
    const noticeCommandRepo = noticeCommandRepository(prismaClient);

    const created = await createNoticeService({
      prisma: prismaClient,
      noticeCommandRepo,
    })({
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

    // create에 event가 포함X
    res.status(201).json(
      toNoticeResponse({
        ...(created as any),
        commentCount: 0,
        event: (created as any).event ?? null,
      } as any),
    );
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
      category: req.query.category as any,
      searchKeyword: req.query.searchKeyword as string | undefined,
    });

    res.json(toNoticeListPagedResponse(result as any));
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

    const notice = await getNoticeDetailQuery(queryRepo)(req.params.noticeId);

    if (!notice) {
      res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
      return;
    }

    res.json(toNoticeResponse(notice as any));
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

    const prismaClient = req.prismaClient;
    const noticeCommandRepo = noticeCommandRepository(prismaClient);

    await updateNoticeService({
      prisma: prismaClient,
      noticeCommandRepo,
    })(req.params.noticeId, {
      title: body.title,
      content: body.content,
      category: body.category,
      type:
        body.isPinned !== undefined
          ? body.isPinned
            ? NoticeType.IMPORTANT
            : NoticeType.NORMAL
          : undefined,
      event:
        body.event === null
          ? null
          : body.event
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
    const noticeCommandRepo = noticeCommandRepository(prismaClient);

    await deleteNoticeService({
      prisma: prismaClient,
      noticeCommandRepo,
    })(req.params.noticeId);

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
