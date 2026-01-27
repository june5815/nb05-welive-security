import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IComplaintCommandRepo } from "../../../_common/ports/repos/complaint/complaint-command-repo.interface";
import { ComplaintEntity } from "../domain/complaints.entity";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const ComplaintCommandService = (
  uow: IUnitOfWork,
  repo: IComplaintCommandRepo,
) => {
  const create = async (dto: any) => {
    await uow.doTx(async () => {
      const complaint = ComplaintEntity.create({
        title: dto.body.title,
        content: dto.body.content,
        isPublic: dto.body.isPublic,
        userId: dto.userId,
        apartmentId: dto.body.apartmentId,
      });

      await repo.create(complaint);
    });
  };

  const update = async (dto: any) => {
    await uow.doTx(async () => {
      const updated = ComplaintEntity.update(
        {
          id: dto.params.complaintId,
          userId: dto.userId,
          apartmentId: dto.body.apartmentId,
        } as any,
        {
          title: dto.body.title,
          content: dto.body.content,
          isPublic: dto.body.isPublic,
        },
      );

      const success = await repo.update(updated);

      if (!success) {
        throw new BusinessException({
          type: BusinessExceptionType.NOT_FOUND,
          message: "존재하지 않거나 이미 처리된 민원입니다.",
        });
      }
    });
  };

  const remove = async (dto: any) => {
    await uow.doTx(async () => {
      await repo.delete(dto.params.complaintId);
    });
  };

  const updateStatus = async (dto: any) => {
    await uow.doTx(async () => {
      await repo.updateStatus(dto.params.complaintId, dto.body.status);
    });
  };

  return {
    create,
    update,
    remove,
    updateStatus,
  };
};
