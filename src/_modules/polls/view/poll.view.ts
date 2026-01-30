export class PollView {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly status: string,
    readonly startAt: Date,
    readonly endAt: Date,
  ) {}

  static from(row: any) {
    return new PollView(row.id, row.title, row.status, row.startAt, row.endAt);
  }
}
