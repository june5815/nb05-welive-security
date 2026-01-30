import { PollStatus } from "@prisma/client";

export type PollVoterScope =
  | { type: "ALL" }
  | { type: "BUILDING"; building: string }
  | { type: "HOUSEHOLD"; householdIds: string[] };

export class Poll {
  constructor(
    readonly id: string,
    readonly apartmentId: string,
    readonly title: string,
    readonly description: string,
    readonly status: PollStatus,
    readonly startAt: Date,
    readonly endAt: Date,
    readonly voterScope: PollVoterScope,
    readonly createdBy: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    apartmentId: string;
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    voterScope: PollVoterScope;
    createdBy: string;
  }) {
    return new Poll(
      crypto.randomUUID(),
      props.apartmentId,
      props.title,
      props.description,
      "PENDING",
      props.startAt,
      props.endAt,
      props.voterScope,
      props.createdBy,
      new Date(),
      new Date(),
    );
  }

  canEdit() {
    return this.status === "PENDING";
  }

  canDelete() {
    return this.status === "PENDING";
  }

  canVote(now = new Date()) {
    return (
      this.status === "IN_PROGRESS" && now >= this.startAt && now <= this.endAt
    );
  }

  shouldStart(now = new Date()) {
    return this.status === "PENDING" && now >= this.startAt;
  }

  shouldClose(now = new Date()) {
    return this.status === "IN_PROGRESS" && now >= this.endAt;
  }
}
