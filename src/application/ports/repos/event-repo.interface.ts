import { Event, Prisma } from "@prisma/client";

export interface IEventRepo {
  create(data: Prisma.EventUncheckedCreateInput): Promise<Event>;

  updateById(
    id: string,
    data: Prisma.EventUncheckedUpdateInput,
  ): Promise<Event>;

  findByNoticeId(noticeId: string): Promise<Event | null>;

  deleteByNoticeId(noticeId: string): Promise<void>;
}
