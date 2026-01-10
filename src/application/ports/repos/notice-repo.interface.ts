import { Notice, Prisma } from "@prisma/client";

export interface INoticeRepo {
  findById(id: string): Promise<Notice | null>;

  create(data: Prisma.NoticeUncheckedCreateInput): Promise<Notice>;

  updateById(id: string, data: Prisma.NoticeUpdateInput): Promise<Notice>;

  deleteById(id: string): Promise<void>;
}
