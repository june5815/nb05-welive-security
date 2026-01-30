export class PollDetailView {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly status: string,
    readonly options: { id: string; text: string; voteCount: number }[],
  ) {}

  static from(row: any) {
    return new PollDetailView(
      row.id,
      row.title,
      row.description,
      row.status,
      row.options,
    );
  }
}
