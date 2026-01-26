import { PrismaClient, ComplaintStatus } from "@prisma/client";
import { IComplaintCommandRepo } from "../../../_common/ports/repos/complaint/complaint-command-repo.interface";
import { Complaint } from "../../../_modules/complaints/domain/complaints.entity";
import { ComplaintMapper } from "../../mappers/complaint.mapper";

export const ComplaintCommandRepo = (
  prisma: PrismaClient,
): IComplaintCommandRepo => {
  const create = async (complaint: Complaint): Promise<void> => {
    await prisma.complaint.create({
      data: ComplaintMapper.toCreate(complaint),
    });
  };

  const update = async (complaint: Complaint): Promise<boolean> => {
    const result = await prisma.complaint.updateMany({
      where: {
        id: complaint.id,
        status: ComplaintStatus.PENDING,
      },
      data: ComplaintMapper.toUpdate(complaint),
    });

    return result.count === 1;
  };

  const deleteById = async (id: string): Promise<void> => {
    await prisma.complaint.delete({
      where: { id },
    });
  };

  const updateStatus = async (id: string, status: string): Promise<void> => {
    await prisma.complaint.update({
      where: { id },
      data: {
        status: status as ComplaintStatus,
      },
    });
  };

  return {
    create,
    update,
    delete: deleteById,
    updateStatus,
  };
};
