import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";

export const getNoticeDetail = async (
  deps: {
    noticeRepo: {
      findById(id: string): Promise<any | null>;
      increaseViewCount(id: string): Promise<void>;
    };
  },
  noticeId: string,
) => {
  const notice = await deps.noticeRepo.findById(noticeId);

  if (!notice) {
    throw new BusinessException({
      type: BusinessExceptionType.NOTICE_NOT_FOUND,
    });
  }

  // 조회수 증가 (비동기, 결과와 분리)
  await deps.noticeRepo.increaseViewCount(noticeId);

  return notice;
};
