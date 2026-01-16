import { z } from "zod";
import { NoticeCategory } from "@prisma/client";

export const UpdateNoticeRequestSchema = z.object({
  title: z.string("변경할 제목을 입력해주세요").optional(),
  content: z.string("변경할 내용을 입력해주세요").optional(),
  category: z.nativeEnum(NoticeCategory).optional(),
  isPinned: z.boolean().optional(),
  event: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .optional(),
});
