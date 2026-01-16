import { NoticeCategory, NoticeType } from "@prisma/client";
import { NoticeEntity } from "../../../command/entities/notice/notice.entity";

export interface NoticeCommandRepository {
  create(
    notice: NoticeEntity,
    meta: {
      apartmentId: string;
      userId: string;
      event?: {
        startDate: Date;
        endDate: Date;
      };
    },
  ): Promise<any>;

  update(
    noticeId: string,
    data: Partial<{
      title: string;
      content: string;
      category: NoticeCategory;
      type: NoticeType;
    }>,
  ): Promise<void>;

  delete(noticeId: string): Promise<void>;
}
