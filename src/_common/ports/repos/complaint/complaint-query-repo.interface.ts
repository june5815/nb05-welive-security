import { Complaint } from "../../../../_modules/complaints/domain/complaints.entity";

export interface ComplaintListResult {
  data: Complaint[];
  totalCount: number;
}

export interface IComplaintQueryRepo {
  findById(id: string): Promise<Complaint | null>;

  findDetailForUser(params: {
    complaintId: string;
    requesterId: string;
    isAdmin: boolean;
  }): Promise<Complaint | null>;

  findListForUser(params: {
    apartmentId: string;
    requesterId: string;
    isAdmin: boolean;
    page: number;
    limit: number;
  }): Promise<ComplaintListResult>;

  increaseViews(id: string): Promise<void>;
}
