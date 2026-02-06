import { Complaint } from "../domain/complaints.entity";

export const ComplaintCommandService = (uow: any) => {
  const create = async (dto: any) => {
    await uow.doTx(async () => {
      const repo = uow.getComplaintRepository();
      const complaint = await repo.create({
        ...dto.body,
        userId: dto.userId,
      });
      await repo.save(complaint);
    });
  };

  const update = async (dto: any) => {
    await uow.doTx(async () => {
      const repo = uow.getComplaintRepository();
      const complaint = await repo.findById(dto.params.complaintId);

      complaint.update(dto.body, dto.userId);

      await repo.save(complaint);
    });
  };

  const remove = async (dto: any) => {
    await uow.doTx(async () => {
      const repo = uow.getComplaintRepository();
      const complaint = await repo.findById(dto.params.complaintId);

      complaint.remove(dto.userId);

      await repo.delete(complaint.id);
    });
  };

  return {
    create,
    update,
    remove,
  };
};
