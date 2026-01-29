import { PollVoterScope } from "./poll.entity";

export class CreatePollCommand {
  constructor(
    readonly apartmentId: string,
    readonly title: string,
    readonly description: string,
    readonly startAt: Date,
    readonly endAt: Date,
    readonly voterScope: PollVoterScope,
    readonly createdBy: string,
  ) {}
}
