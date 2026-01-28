import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { NoticeQueryRepository } from "../../../_common/ports/repos/notice/notice-query-repo.interface";
import {
  toNoticeListPagedResponse,
  toNoticeResponse,
} from "../../../_infra/mappers/notice.mapper";
import {
  GetNoticeListReqDto,
  GetNoticeDetailReqDto,
} from "../dtos/req/notice.request";

export interface INoticeQueryService {
  getNoticeList: (dto: GetNoticeListReqDto) => Promise<any>;
  getNoticeDetail: (dto: GetNoticeDetailReqDto) => Promise<any>;
}

export const NoticeQueryService = (deps: {
  noticeQueryRepo: NoticeQueryRepository;
}): INoticeQueryService => {
  const { noticeQueryRepo } = deps;

  const getNoticeList = async (dto: GetNoticeListReqDto) => {
    const { userApartmentId, query } = dto;

    const result = await noticeQueryRepo.findList({
      page: query.page,
      limit: query.limit,
      apartmentId: userApartmentId,
      category: query.category,
      searchKeyword: query.searchKeyword,
    });

    return toNoticeListPagedResponse({
      ...result,
      page: query.page,
      limit: query.limit,
    });
  };

  const getNoticeDetail = async (dto: GetNoticeDetailReqDto) => {
    const { params } = dto;

    const notice = await noticeQueryRepo.findDetail(params.noticeId);

    if (!notice) {
      throw new BusinessException({
        type: BusinessExceptionType.NOTICE_NOT_FOUND,
      });
    }

    return toNoticeResponse(notice);
  };

  return {
    getNoticeList,
    getNoticeDetail,
  };
};
