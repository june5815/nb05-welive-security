import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { INoticeCommandService } from "./service/notice-command.service";
import { INoticeQueryService } from "./service/notice-query.service";
import {
  createNoticeBodySchema,
  deleteNoticeReqSchema,
  getNoticeDetailReqSchema,
  getNoticeListReqSchema,
  updateNoticeReqSchema,
} from "./dtos/req/notice.request";
import { toNoticeResponse } from "../../_infra/mappers/notice.mapper";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";

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

  const createNotice = async (req: Request, res: Response): Promise<void> => {
    const body = validate(createNoticeBodySchema, req.body);

    const userId = req.user?.id;
    const userApartmentId = req.user?.apartmentId;

    if (!userId) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED,
        message: "인증 정보가 없습니다.",
      });
    }

    if (userApartmentId && userApartmentId !== body.apartmentId) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED,
        message: "해당 아파트에 공지를 등록할 수 없습니다.",
      });
    }

    const apartmentId = userApartmentId ?? body.apartmentId;

    const created = await noticeCommandService.createNotice({
      userId,
      apartmentId,
      body,
    });

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
  const getNoticeList = async (req: Request, res: Response): Promise<void> => {
    console.log("🧾 getNoticeList req.user =", req.user);
    console.log("🧾 getNoticeList req.query =", req.query);
    const apartmentId = req.user?.apartmentId;

    if (!apartmentId) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED,
        message:
          "apartmentId가 토큰/세션에 없습니다. 로그인 정보를 확인해주세요.",
      });
    }

    const reqDto = validate(getNoticeListReqSchema, {
      userApartmentId: apartmentId,
      query: req.query,
    });

    const result = await noticeQueryService.getNoticeList(reqDto);
    res.status(200).json(result);
  };

  /**
   * 공지 상세 조회
   */
  const getNoticeDetail = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const reqDto = validate(getNoticeDetailReqSchema, {
      params: req.params,
    });

    const result = await noticeQueryService.getNoticeDetail(reqDto);
    res.status(200).json(result);
  };

  /**
   * 공지 수정
   */
  const updateNotice = async (req: Request, res: Response): Promise<void> => {
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
  const deleteNotice = async (req: Request, res: Response): Promise<void> => {
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
