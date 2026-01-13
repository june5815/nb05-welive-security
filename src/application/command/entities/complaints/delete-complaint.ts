import { IComplaintRepo } from "../../../ports/repos/complaint-repo.interface";
import { ComplaintStatus } from "../../entities/complaints/complaints.entity";

export const DeleteComplaint =
  (complaintRepo: IComplaintRepo) =>
  async (complaintId: string, userId: string) => {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint) return;

    if (
      complaint.userId !== userId ||
      complaint.status !== ComplaintStatus.PENDING
    ) {
      return;
    }

    await complaintRepo.delete(complaintId);
  };
