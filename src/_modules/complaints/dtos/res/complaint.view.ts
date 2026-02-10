import { ComplaintStatus } from "../../domain/complaints.entity";

export interface ComplaintView {
  id: string;
  title: string;
  content: string;
  status: keyof typeof ComplaintStatus;
  isPublic: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;

  complainant: {
    id: string;
    name: string;
  };

  apartmentId: string;
}

export const ComplaintView = {
  from(model: any): ComplaintView {
    return {
      id: model.id,
      title: model.title,
      content: model.content,
      status: model.status,
      isPublic: model.isPublic,
      viewsCount: model.viewsCount,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      apartmentId: model.apartmentId,
      complainant: {
        id: model.user.id,
        name: model.user.name,
      },
    };
  },
};
