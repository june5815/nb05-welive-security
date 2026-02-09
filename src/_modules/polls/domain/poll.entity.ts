export class Poll {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public readonly creatorId: string,
    public readonly creatorName: string | undefined,
    public startAt: Date,
    public endAt: Date,
    public status: string,
    public options: {
      id: string;
      text: string;
      voteCount: number;
    }[],
  ) {}

  static create(data: {
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    creatorId: string;
    options: { text: string }[];
  }) {
    return new Poll(
      crypto.randomUUID(),
      data.title,
      data.description,
      data.creatorId,
      undefined,
      data.startAt,
      data.endAt,
      "PENDING",
      data.options.map((o) => ({
        id: crypto.randomUUID(),
        text: o.text,
        voteCount: 0,
      })),
    );
  }
}
