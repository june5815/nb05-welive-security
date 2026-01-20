import { NoticeCategory, NoticeType } from "@prisma/client";

export interface CreateNoticeCommand {
  title: string;
  content: string;
  category: NoticeCategory;
  type: NoticeType;
  apartmentId: string;
  userId: string;
  event?: {
    startDate: Date;
    endDate: Date;
  };
}
