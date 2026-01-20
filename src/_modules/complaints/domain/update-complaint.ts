import { IComplaintRepo } from "../../../_common/ports/repos/complaint/complaint-repo.interface";
import { ComplaintEntity } from "./complaints.entity";

export const UpdateComplaint =
  (complaintRepo: IComplaintRepo) =>
  async (
    complaintId: string,
    userId: string,
    props: { title: string; content: string; isPublic: boolean },
  ) => {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.userId !== userId) return null;

    const updated = ComplaintEntity.update(complaint, props);
    return await complaintRepo.update(updated);
  };
