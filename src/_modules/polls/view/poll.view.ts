export const PollView = (p: any, building = 0) => ({
  id: p.id,
  createdAt: p.createdAt,
  title: p.title,
  content: p.content,
  status: p.status,
  startDate: p.createdAt,
  endDate: p.endDate,
  apartmentId: p.apartmentId,
  building,
  author: {
    id: p.user.id,
    name: p.user.name,
  },
});
