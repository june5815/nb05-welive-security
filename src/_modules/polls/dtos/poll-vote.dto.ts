export interface VotePollDto {
  params: {
    pollId: string;
    optionId: string;
  };
  user: {
    id: string;
    role: "USER";
    apartmentId: string;
  };
}
