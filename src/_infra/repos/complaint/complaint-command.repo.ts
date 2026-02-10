import { PrismaClient, ComplaintStatus } from "@prisma/client";
import { IComplaintCommandRepo } from "../../../_common/ports/repos/complaint/complaint-command-repo.interface";
import { Complaint } from "../../../_modules/complaints/domain/complaints.entity";
import {
  ComplaintMapper,
  complaintInclude,
} from "../../mappers/complaint.mapper";

export const ComplaintCommandRepo = (
  prisma: PrismaClient,
): IComplaintCommandRepo => {
  const create = async (complaint: Complaint): Promise<Complaint> => {
    const created = await prisma.complaint.create({
      data: ComplaintMapper.toCreate(complaint),
      include: complaintInclude,
    });
    return ComplaintMapper.toEntity(created);
  };

  const update = async (complaint: Complaint): Promise<boolean> => {
    const result = await prisma.complaint.updateMany({
      where: {
        id: complaint.id!,
        status: ComplaintStatus.PENDING,
      },
      data: ComplaintMapper.toUpdate(complaint),
    });

    return result.count === 1;
  };

  const deleteById = async (id: string) => {
    await prisma.complaint.delete({
      where: { id },
    });
  };

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    await prisma.complaint.updateMany({
      where: {
        id,
        status: ComplaintStatus.PENDING,
      },
      data: { status },
    });
  };

  return {
    create,
    update,
    delete: deleteById,
    updateStatus,
  };
};
