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
    const isAdmin = dto.role === "ADMIN" || dto.role === "SUPER_ADMIN";

    const complaint = await complaintQueryRepo.findDetailForUser({
      complaintId: dto.params.complaintId,
      requesterId: dto.userId,
      isAdmin,
    });

    if (!complaint) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
      });
    }

    await complaintQueryRepo.increaseViews(complaint.id!);

    return ComplaintView.from(complaint);
  };

  const getList = async (dto: any) => {
    const { apartmentId, page, limit } = dto.query;
    const isAdmin = dto.role === "ADMIN" || dto.role === "SUPER_ADMIN";

    const result = await complaintQueryRepo.findListForUser({
      apartmentId,
      requesterId: dto.userId,
      isAdmin,
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

  return { getDetail, getList };
};
