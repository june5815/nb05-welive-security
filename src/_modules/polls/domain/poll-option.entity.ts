export class PollOption {
  constructor(
    readonly id: string,
    readonly pollId: string,
    readonly text: string,
    readonly order: number,
  ) {}

  static create(pollId: string, text: string, order: number) {
    return new PollOption(crypto.randomUUID(), pollId, text, order);
  }
}
