import { Complaint } from "../../../../_modules/complaints/domain/complaints.entity";

export interface IComplaintCommandRepo {
  create(complaint: Complaint): Promise<Complaint>;
  update(complaint: Complaint): Promise<boolean>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
}
