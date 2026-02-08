export const PollView = (p: any) => ({
  id: p.id,
  title: p.title,
  status: p.status,
  startAt: p.startAt,
  endAt: p.endAt,
  totalVotes: p.totalVotes,
});
