import { IComplaintRepo } from "../../../ports/repos/complaint-repo.interface";
import {
  ComplaintEntity,
  TComplaintStatus,
} from "../../entities/complaints/complaints.entity";

export const ChangeComplaintStatus =
  (complaintRepo: IComplaintRepo) =>
  async (complaintId: string, status: TComplaintStatus) => {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint) return null;

    const updated = ComplaintEntity.changeStatus(complaint, status);
    return await complaintRepo.update(updated);
  };
