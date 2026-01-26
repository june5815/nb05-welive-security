import { IComplaintQueryRepo } from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const ComplaintQueryService = (
  complaintQueryRepo: IComplaintQueryRepo,
) => {
  const getList = async (dto: any) => {
    const { userId, role, query } = dto;

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    return complaintQueryRepo.findList({
      apartmentId: query.apartmentId,
      page: query.page,
      limit: query.limit,
    });
  };

  const getDetail = async (dto: any) => {
    const complaint = await complaintQueryRepo.findById(dto.params.complaintId);

    if (!complaint) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
      });
    }

    return complaint;
  };

  return {
    getList,
    getDetail,
  };
};
