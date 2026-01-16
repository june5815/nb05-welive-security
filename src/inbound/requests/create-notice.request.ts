import { NoticeCategory } from "@prisma/client";
import { z } from "zod";

export const CreateNoticeRequestSchema = z.object({
  title: z.string("제목을 입력해주세요"),
  content: z.string("내용을 입력해주세요"),
  category: z.nativeEnum(NoticeCategory),
  isPinned: z.boolean().optional(),
  apartmentId: z.string(),
  event: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .optional(),
});

export type CreateNoticeRequest = z.infer<typeof CreateNoticeRequestSchema>;
