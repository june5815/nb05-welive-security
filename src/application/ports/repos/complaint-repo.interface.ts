import { Complaint } from "../../command/entities/complaints/complaints.entity";

export interface IComplaintRepo {
  create(complaint: Complaint): Promise<Complaint>;
  findById(id: string): Promise<Complaint | null>;
  findMany(apartmentId: string): Promise<Complaint[]>;
  update(complaint: Complaint): Promise<Complaint>;
  delete(id: string): Promise<void>;
}