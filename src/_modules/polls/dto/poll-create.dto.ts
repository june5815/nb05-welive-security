import { PollVoterScope } from "../domain/poll.entity";

export type CreatePollDto = {
  body: {
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    options: { text: string }[];
    voterScope: PollVoterScope;
  };
  userId: string;
  apartmentId: string;
};
