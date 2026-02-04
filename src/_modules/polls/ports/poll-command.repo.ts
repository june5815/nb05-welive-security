import { Poll } from "../domain/poll.entity";

export interface IPollCommandRepo {
  save(poll: Poll): Promise<void>;
  findById(id: string, lock?: "update"): Promise<Poll | null>;
  update(poll: Poll): Promise<void>;
  delete(id: string): Promise<void>;

  vote(pollId: string, optionId: string, userId: string): Promise<void>;
  cancelVote(pollId: string, userId: string): Promise<void>;
}
