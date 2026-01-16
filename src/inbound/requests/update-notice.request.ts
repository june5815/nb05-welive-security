import { z } from "zod";
import { NoticeCategory } from "@prisma/client";

export const UpdateNoticeRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.nativeEnum(NoticeCategory).optional(),
  isPinned: z.boolean().optional(),
  event: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .optional(),
});
