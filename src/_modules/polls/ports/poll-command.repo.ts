import { Poll } from "../domain/poll.entity";

export interface IPollCommandRepo {
  create(poll: Poll, options: { id: string; text: string }[]): Promise<void>;
  update(pollId: string, data: Partial<Poll>): Promise<void>;
  delete(pollId: string): Promise<void>;
  vote(pollId: string, optionId: string, userId: string): Promise<void>;
  cancelVote(pollId: string, userId: string): Promise<void>;
}
