import { IComplaintRepo } from "../../../_common/ports/repos/complaint/complaint-repo.interface";
import { ComplaintEntity, Complaint } from "./complaints.entity";

export const CreateComplaint =
  (complaintRepo: IComplaintRepo) =>
  async (props: {
    title: string;
    content: string;
    isPublic: boolean;
    userId: string;
    apartmentId: string;
  }): Promise<Complaint> => {
    const complaint = ComplaintEntity.create(props);
    return await complaintRepo.create(complaint);
  };
