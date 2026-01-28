import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { INoticeCommandService } from "./service/notice-command.service";
import { INoticeQueryService } from "./service/notice-query.service";
import {
  createNoticeReqSchema,
  deleteNoticeReqSchema,
  getNoticeDetailReqSchema,
  getNoticeListReqSchema,
  updateNoticeReqSchema,
} from "./dtos/req/notice.request";
import { toNoticeResponse } from "../../_infra/mappers/notice.mapper";

export interface INoticeController {
  createNotice: (req: Request, res: Response) => Promise<void>;
  getNoticeList: (req: Request, res: Response) => Promise<void>;
  getNoticeDetail: (req: Request, res: Response) => Promise<void>;
  updateNotice: (req: Request, res: Response) => Promise<void>;
  deleteNotice: (req: Request, res: Response) => Promise<void>;
}

export const NoticeController = (
  baseController: IBaseController,
  noticeQueryService: INoticeQueryService,
  noticeCommandService: INoticeCommandService,
): INoticeController => {
  const validate = baseController.validate;

  /**
   * 공지 생성
   */
  const createNotice = async (req: Request, res: Response) => {
    const reqDto = validate(createNoticeReqSchema, {
      userId: req.user!.id,
      userApartmentId: req.user!.apartmentId,
      body: req.body,
    });

    const created = await noticeCommandService.createNotice(reqDto);

    res.status(201).json(
      toNoticeResponse({
        ...created,
        commentCount: 0,
        event: created.event ?? null,
      }),
    );
  };

  /**
   * 공지 목록 조회
   */
  const getNoticeList = async (req: Request, res: Response) => {
    const reqDto = validate(getNoticeListReqSchema, {
      userApartmentId: req.user!.apartmentId,
      query: req.query,
    });

    const result = await noticeQueryService.getNoticeList(reqDto);

    res.status(200).json(result);
  };

  /**
   * 공지 상세 조회
   */
  const getNoticeDetail = async (req: Request, res: Response) => {
    const reqDto = validate(getNoticeDetailReqSchema, {
      params: req.params,
    });

    const result = await noticeQueryService.getNoticeDetail(reqDto);

    res.status(200).json(result);
  };

  /**
   * 공지 수정
   */
  const updateNotice = async (req: Request, res: Response) => {
    const reqDto = validate(updateNoticeReqSchema, {
      params: req.params,
      body: req.body,
    });

    await noticeCommandService.updateNotice(reqDto);

    res.status(204).json();
  };

  /**
   * 공지 삭제
   */
  const deleteNotice = async (req: Request, res: Response) => {
    const reqDto = validate(deleteNoticeReqSchema, {
      params: req.params,
    });

    await noticeCommandService.deleteNotice(reqDto);

    res.status(204).json();
  };

  return {
    createNotice,
    getNoticeList,
    getNoticeDetail,
    updateNotice,
    deleteNotice,
  };
};
