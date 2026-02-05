export interface IPollQueryRepo {
  findList(params: {
    apartmentId: string;
    status?: string;
    skip: number;
    take: number;
  }): Promise<{ data: any[]; totalCount: number }>;

  findDetail(pollId: string, userId?: string): Promise<any>;
}
