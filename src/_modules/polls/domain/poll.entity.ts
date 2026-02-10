import { PollStatus } from "@prisma/client";

export class Poll {
  constructor(
    readonly id: string,
    readonly apartmentId: string,
    readonly title: string,
    readonly description: string,
    readonly status: PollStatus,
    readonly endAt: Date,
    readonly voterScope: { type: "ALL" },
    readonly createdBy: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    apartmentId: string;
    title: string;
    description: string;
    endAt: Date;
    voterScope: { type: "ALL" };
    createdBy: string;
  }) {
    const now = new Date();

    return new Poll(
      crypto.randomUUID(),
      props.apartmentId,
      props.title,
      props.description,
      "PENDING",
      props.endAt,
      props.voterScope,
      props.createdBy,
      now,
      now,
    );
  }

  canEdit() {
    return this.status === "PENDING";
  }

  canVote() {
    return this.status === "IN_PROGRESS";
  }

  shouldStart() {
    return this.status === "PENDING";
  }

  shouldClose() {
    return this.status === "IN_PROGRESS" && new Date() >= this.endAt;
  }
}
