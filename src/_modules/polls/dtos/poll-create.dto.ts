export interface CreatePollDto {
  body: {
    title: string;
    content: string;
    endDate: string;
    options: string[];
  };
  user: {
    id: string;
    role: "ADMIN" | "SUPER_ADMIN";
    apartmentId: string;
  };
}
