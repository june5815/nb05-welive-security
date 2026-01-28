import { CommentResourceType } from "@prisma/client";

export interface CommentQueryRepository {
  findList(params: {
    page: number;
    limit: number;
    resourceId: string;
    resourceType: CommentResourceType;
  }): Promise<{
    data: any[];
    totalCount: number;
    page: number;
    limit: number;
    hasNext: boolean;
  }>;
}
