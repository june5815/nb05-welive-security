import { Poll } from "../domain/poll.entity";
import { PollOption } from "../domain/poll-option.entity";

export interface IPollCommandRepo {
  save(poll: Poll): Promise<void>;
  saveWithOptions(poll: Poll, options: PollOption[]): Promise<void>;
  findById(id: string, lock?: "update"): Promise<Poll | null>;
  update(poll: Poll): Promise<void>;
  delete(id: string): Promise<void>;

  vote(pollId: string, optionId: string, userId: string): Promise<void>;
  cancelVote(pollId: string, userId: string): Promise<void>;

  findAllActive(): Promise<Poll[]>;
  markInProgress(id: string): Promise<void>;
  markClosed(id: string): Promise<void>;
}
