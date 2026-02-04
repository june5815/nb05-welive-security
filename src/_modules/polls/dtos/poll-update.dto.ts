export interface UpdatePollDto {
  params: { pollId: string };
  body: {
    title?: string;
    content?: string;
    endDate?: string;
  };
  user: {
    id: string;
    role: "ADMIN" | "SUPER_ADMIN";
    apartmentId: string;
  };
}
