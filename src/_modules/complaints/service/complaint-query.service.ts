import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { IComplaintQueryRepo } from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";
import { ComplaintView } from "../dtos/res/complaint.view";

export const ComplaintQueryService = (
  complaintQueryRepo: IComplaintQueryRepo,
) => {
  const getDetail = async (dto: any) => {
    const complaint = await complaintQueryRepo.findById(dto.params.complaintId);

    if (!complaint) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
      });
    }

    return ComplaintView.from(complaint);
  };

  const getList = async (dto: any) => {
    const { apartmentId, page, limit } = dto.query;

    const result = await complaintQueryRepo.findList({
      apartmentId,
      page,
      limit,
    });

    return {
      data: result.data.map(ComplaintView.from),
      totalCount: result.totalCount,
      page,
      limit,
      hasNext: page * limit < result.totalCount,
    };
  };

  return {
    getDetail,
    getList,
  };
};
