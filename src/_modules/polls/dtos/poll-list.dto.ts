import { PollStatus } from "@prisma/client";

export type GetPollListDto = {
  query: {
    apartmentId: string;
    status?: PollStatus;
    keyword?: string;
    page?: number;
    limit?: number;
  };
};
