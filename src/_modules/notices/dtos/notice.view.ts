import { NoticeCategory } from "@prisma/client";

export interface GetNoticeListQuery {
  page: number;
  limit: number;
  category?: NoticeCategory;
  searchKeyword?: string;
  apartmentId: string;
}
