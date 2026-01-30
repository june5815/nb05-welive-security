export interface IPollQueryRepo {
  findById(pollId: string): Promise<any | null>;
  findList(query: {
    apartmentId: string;
    status?: string;
    keyword?: string;
    skip: number;
    take: number;
  }): Promise<{ data: any[]; totalCount: number }>;
}
