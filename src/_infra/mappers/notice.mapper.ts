import { NoticeCategory, NoticeType } from "@prisma/client";

export interface NoticeAuthorDto {
  id: string;
  name: string;
}

export interface NoticeEventDto {
  id: string;
  startDate: Date;
  endDate: Date;
}

export interface NoticeResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  viewsCount: number;
  apartmentId: string;
  author: NoticeAuthorDto;
  commentCount: number;
  event: NoticeEventDto | null;
}

type NoticeSource = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  category: NoticeCategory;
  type: NoticeType;
  viewCount: number;
  apartmentId: string;
  user: { id: string; name: string };
  event?: { id: string; startDate: Date; endDate: Date } | null;
  commentCount?: number | null;
};

export const toNoticeResponse = (notice: NoticeSource): NoticeResponseDto => ({
  id: notice.id,
  createdAt: notice.createdAt,
  updatedAt: notice.updatedAt,
  title: notice.title,
  content: notice.content,
  category: notice.category,
  isPinned: notice.type === NoticeType.IMPORTANT,
  viewsCount: notice.viewCount,
  apartmentId: notice.apartmentId,
  author: {
    id: notice.user.id,
    name: notice.user.name,
  },
  commentCount: notice.commentCount ?? 0,
  event: notice.event
    ? {
        id: notice.event.id,
        startDate: notice.event.startDate,
        endDate: notice.event.endDate,
      }
    : null,
});

export const toNoticeListResponse = (notices: NoticeSource[] = []) =>
  notices.map(toNoticeResponse);

export const toNoticeListPagedResponse = (args: {
  data?: NoticeSource[];
  items?: NoticeSource[];
  totalCount?: number;
  total?: number;
  page: number;
  limit: number;
}) => {
  const data = args.data ?? args.items ?? [];
  const totalCount = args.totalCount ?? args.total ?? 0;

  return {
    data: toNoticeListResponse(data),
    totalCount,
    page: args.page,
    limit: args.limit,
    hasNext: args.page * args.limit < totalCount,
  };
};
