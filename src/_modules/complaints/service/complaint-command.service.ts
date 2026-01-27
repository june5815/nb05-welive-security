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
      /**
       * CommandRepo는 조회 책임이 없으므로
       * 기존 엔티티를 "가정"하고 update 시도
       */
      const origin = {
        id: dto.params.complaintId,
        title: dto.body.title,
        content: dto.body.content,
        isPublic: dto.body.isPublic,
        userId: dto.userId,
        apartmentId: dto.body.apartmentId,
        status: "PENDING",
      };

      const updated = ComplaintEntity.update(origin as any, {
        title: dto.body.title,
        content: dto.body.content,
        isPublic: dto.body.isPublic,
      });

      const success = await repo.update(updated);
      if (!success) {
        throw new BusinessException({
          type: BusinessExceptionType.NOT_FOUND,
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
