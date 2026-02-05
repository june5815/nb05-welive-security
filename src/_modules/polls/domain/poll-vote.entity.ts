export class VotePollCommand {
  constructor(
    readonly pollId: string,
    readonly optionId: string,
    readonly userId: string,
  ) {}
}
