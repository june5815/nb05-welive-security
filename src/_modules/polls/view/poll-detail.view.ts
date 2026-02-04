import { Poll } from "../domain/poll.entity";

export class PollDetailView {
  static from(poll: Poll) {
    return {
      id: poll.id,
      title: poll.title,
      content: poll.description,
      status: poll.status,
      startAt: poll.startAt,
      endAt: poll.endAt,
    };
  }
}
