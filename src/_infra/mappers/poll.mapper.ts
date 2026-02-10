export const toPollListItemResponse = (p: any) => ({
  id: p.id,
  createdAt: p.createdAt,
  title: p.title,
  content: p.content,
  status: p.status,
  startDate: p.startDate,
  endDate: p.endDate,
  apartmentId: p.apartmentId,
  building: p.building,
  author: {
    id: p.user?.id ?? p.author?.id,
    name: p.user?.name ?? p.author?.name,
  },
});

export const toPollListPagedResponse = (page: {
  data: any[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}) => ({
  data: page.data.map(toPollListItemResponse),
  totalCount: page.totalCount,
  page: page.page,
  limit: page.limit,
  hasNext: page.hasNext,
});

export const toPollDetailResponse = (p: any) => ({
  id: p.id,
  createdAt: p.createdAt,
  title: p.title,
  content: p.content,
  status: p.status,
  startDate: p.startDate,
  endDate: p.endDate,
  apartmentId: p.apartmentId,
  building: p.building,
  author: {
    id: p.user?.id ?? p.author?.id,
    name: p.user?.name ?? p.author?.name,
  },
  options: (p.options ?? []).map((o: any) => ({
    id: o.id,
    title: o.title,
    voteCount:
      typeof o.voteCount === "number" ? o.voteCount : (o._count?.votes ?? 0),
  })),
  optionIdVotedByMe: p.optionIdVotedByMe ?? null,
});
