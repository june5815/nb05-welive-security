import { Poll } from "../../_modules/polls/domain/poll.entity";

export const PollMapper = {
  toCreate: (p: Poll) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    startAt: p.startAt,
    endAt: p.endAt,
    creatorId: p.creatorId,
    options: {
      create: p.options.map((o) => ({
        id: o.id,
        text: o.text,
      })),
    },
  }),

  toUpdate: (p: Poll) => ({
    title: p.title,
    description: p.description,
    startAt: p.startAt,
    endAt: p.endAt,
  }),

  toDomain: (row: any): Poll => {
    return new Poll(
      row.id,
      row.title,
      row.description,
      row.creatorId,
      row.creator?.name,
      row.startAt,
      row.endAt,
      row.status,
      row.options.map((o: any) => ({
        id: o.id,
        text: o.text,
        voteCount: o.voteCount,
      })),
    );
  },
};
