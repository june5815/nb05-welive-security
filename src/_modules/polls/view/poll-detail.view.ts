export const PollDetailView = (p: any) => ({
  id: p.id,
  title: p.title,
  content: p.content,
  status: p.status,
  startAt: p.startAt,
  endAt: p.endAt,
  author: {
    id: p.author.id,
    name: p.author.name,
  },
  totalVotes: p.totalVotes,
  options: p.options.map((o: any) => ({
    id: o.id,
    text: o.text,
    voteCount: o.voteCount,
    isMine: o.isMine,
  })),
});
