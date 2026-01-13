import { NoticeCategory, NoticeType } from "@prisma/client";

interface GetNoticesQueryInput {
  apartmentId: string;
  category?: NoticeCategory;
  isPinned?: boolean;
  page?: number;
  limit?: number;
}

export const getNotices = async (
  deps: {
    noticeRepo: {
      findMany(params: {
        apartmentId: string;
        category?: NoticeCategory;
        type?: NoticeType;
        skip: number;
        take: number;
      }): Promise<any[]>;
    };
  },
  input: GetNoticesQueryInput,
) => {
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;
  const skip = (page - 1) * limit;

  return deps.noticeRepo.findMany({
    apartmentId: input.apartmentId,
    category: input.category,
    type:
      input.isPinned === undefined
        ? undefined
        : input.isPinned
          ? NoticeType.IMPORTANT
          : NoticeType.NORMAL,
    skip,
    take: limit,
  });
};
