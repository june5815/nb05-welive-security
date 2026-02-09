import { Complaint } from "../../../../_modules/complaints/domain/complaints.entity";

export interface ComplaintListResult {
  data: any[];
  totalCount: number;
}

export interface IComplaintQueryRepo {
  findById(id: string): Promise<Complaint | null>;

  findDetailForUser(params: {
    complaintId: string;
    requesterId: string;
    isAdmin: boolean;
    apartmentId: string;
  }): Promise<any | null>;

  findListForUser(params: {
    apartmentId: string;
    requesterId: string;
    isAdmin: boolean;
    page: number;
    limit: number;
    status?: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  }): Promise<ComplaintListResult>;

  increaseViews(id: string): Promise<void>;
}
