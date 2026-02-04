import { Poll } from "../domain/poll.entity";

export class PollView {
  static from(poll: Poll) {
    return {
      id: poll.id,
      title: poll.title,
      status: poll.status,
      startAt: poll.startAt,
      endAt: poll.endAt,
    };
  }
}
