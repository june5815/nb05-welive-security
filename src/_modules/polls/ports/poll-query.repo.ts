import { Poll } from "../domain/poll.entity";

export interface IPollQueryRepo {
  findList(options: {
    apartmentId: string;
    status?: string;
    skip: number;
    take: number;
  }): Promise<{ data: Poll[]; totalCount: number }>;

  findById(id: string): Promise<Poll | null>;
}
