export interface NoticeQueryRepository {
  findList(params: {
    page: number;
    limit: number;
    category?: string;
    searchKeyword?: string;
    apartmentId: string;
  }): Promise<{
    data: any[];
    totalCount: number;
  }>;

  findDetail(noticeId: string): Promise<any>;
}
