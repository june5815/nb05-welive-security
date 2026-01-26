import { Complaint, TComplaintStatus } from "../../domain/complaints.entity";

export interface ComplaintView {
  id: string;
  title: string;
  content: string;
  status: TComplaintStatus;
  isPublic: boolean;
  viewsCount: number;
  userId: string;
  apartmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ComplaintView = {
  from(entity: Complaint): ComplaintView {
    return {
      id: entity.id!,
      title: entity.title,
      content: entity.content,
      status: entity.status!,
      isPublic: entity.isPublic,
      viewsCount: entity.viewsCount ?? 0,
      userId: entity.userId,
      apartmentId: entity.apartmentId,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  },
};
