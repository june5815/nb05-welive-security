import { Complaint } from "../../../../_modules/complaints/domain/complaints.entity";

export interface ComplaintListResult {
  data: Complaint[];
  totalCount: number;
}

export interface IComplaintQueryRepo {
  findById(id: string): Promise<Complaint | null>;

  findMany(apartmentId: string): Promise<Complaint[]>;

  findList(params: {
    apartmentId: string;
    page: number;
    limit: number;
  }): Promise<ComplaintListResult>;
}
