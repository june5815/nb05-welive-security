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

type ResolveParams = {
  userId?: string;
  role?: string;
  tokenApartmentId?: string;
};

export interface INoticeQueryService {
  getNoticeList: (dto: GetNoticeListReqDto) => Promise<any>;
  getNoticeDetail: (dto: GetNoticeDetailReqDto) => Promise<any>;
  resolveApartmentId: (params: ResolveParams) => Promise<string>;
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

  const resolveApartmentId = async ({
    userId,
    role,
    tokenApartmentId,
  }: ResolveParams): Promise<string> => {
    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED,
        message: "인증 정보가 없습니다.",
      });
    }

    if (role === "USER") {
      if (!tokenApartmentId) {
        throw new BusinessException({
          type: BusinessExceptionType.UNAUTHORIZED,
          message:
            "apartmentId가 토큰/세션에 없습니다. 로그인 정보를 확인해주세요.",
        });
      }
      return tokenApartmentId;
    }

    if (role === "ADMIN") {
      if (tokenApartmentId) return tokenApartmentId;

      const aptId = await noticeQueryRepo.findApartmentIdByAdminId(userId);
      if (!aptId) {
        throw new BusinessException({
          type: BusinessExceptionType.UNAUTHORIZED,
          message:
            "관리자 아파트 정보를 찾을 수 없습니다. 관리자 계정을 확인해주세요.",
        });
      }
      return aptId;
    }

    throw new BusinessException({
      type: BusinessExceptionType.FORBIDDEN,
      message: "공지 접근 권한이 없습니다.",
    });
  };

  return {
    getNoticeList,
    getNoticeDetail,
    resolveApartmentId,
  };
};
