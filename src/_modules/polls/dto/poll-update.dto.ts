export type UpdatePollDto = {
  params: {
    pollId: string;
  };
  body: {
    title?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
  };
};
