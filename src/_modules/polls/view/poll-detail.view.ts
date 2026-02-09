export const PollDetailView = (p: any, building = 0) => {
  const optionIdVotedByMe =
    Array.isArray(p.votes) && p.votes.length > 0 ? p.votes[0].optionId : "";

  return {
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
    options: p.options.map((o: any) => ({
      id: o.id,
      title: o.text,
      voteCount: o.voteCount,
    })),
    optionIdVotedByMe,
  };
};
