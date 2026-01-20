import { IComplaintRepo } from "../../../ports/repos/complaint-repo.interface";
import {
  ComplaintEntity,
  Complaint,
} from "../../entities/complaints/complaints.entity";

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
