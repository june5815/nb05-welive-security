export interface PollOptionResultDto {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollResultDto {
  pollId: string;
  title: string;
  totalVotes: number;
  options: PollOptionResultDto[];
}
