import { Request, Response } from "express";
import { createNotice } from "../../application/command/entities/notice/create-notice";
import { getNotices } from "../../application/query/notice/get-notice.query";
import { getNoticeDetail } from "../../application/query/notice/get-notice-detail.query";

export const NoticeController = (deps: {
  noticeRepo: any;
  eventRepo: any;
  nontificationRepo: any;
  unitOfWork: any;
}) => ({
  /**
   * POST /api/v2/notices
   * 관리자 공지 등록
   */
  async createNotice(req: Request, res: Response) {
    const user = req.user!; // auth middleware에서 주입
    const { title, content, category, isPinned, apartmentId, event } = req.body;

    const notice = await createNotice(
      {
        noticeRepo: deps.noticeRepo,
        eventRepo: deps.eventRepo,
        nontificationRepo: deps.nontificationRepo,
        unitOfWork: deps.unitOfWork,
      },
      {
        title,
        content,
        category,
        isPinned,
        apartmentId,
        event,
      },
      user,
    );

    return res.status(201).json(notice);
  },

  /**
   * GET /api/v2/notices
   * 공지 목록 조회
   */
  async getNotices(req: Request, res: Response) {
    const user = req.user!;
    const { category, isPinned, page, limit } = req.query;

    const notices = await getNotices(
      {
        noticeRepo: deps.noticeRepo,
      },
      {
        apartmentId: user.apartmentId,
        category: category as any,
        isPinned: isPinned === undefined ? undefined : isPinned === "true",
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );

    return res.status(200).json(notices);
  },

  /**
   * GET /api/v2/notices/:noticeId
   * 공지 상세 조회
   */
  async getNoticeDetail(req: Request, res: Response) {
    const { noticeId } = req.params;

    const notice = await getNoticeDetail(
      {
        noticeRepo: deps.noticeRepo,
      },
      noticeId,
    );

    return res.status(200).json(notice);
  },
});
