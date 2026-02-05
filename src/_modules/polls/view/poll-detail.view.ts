export class PollDetailView {
  static from(poll: any, options: any[], myVote?: string) {
    return {
      id: poll.id,
      title: poll.title,
      status: poll.status,
      startAt: poll.startAt,
      endAt: poll.endDate,
      options: options.map((o) => ({
        id: o.id,
        text: o.text,
        voteCount: o._count.votes,
        isMine: o.id === myVote,
      })),
    };
  }
}
