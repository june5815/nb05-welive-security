import { NoticeCategory } from "@prisma/client";

export interface NoticeQueryRepository {
  findList(params: {
    page: number;
    limit: number;
    category?: NoticeCategory;
    searchKeyword?: string;
    apartmentId: string;
  }): Promise<{
    data: any[];
    totalCount: number;
  }>;

  findDetail(noticeId: string): Promise<any>;
}
