import { NoticeCategory } from "@prisma/client";
import { z } from "zod";

export const CreateNoticeRequestSchema = z.object({
  title: z.string(),
  content: z.string(),
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
