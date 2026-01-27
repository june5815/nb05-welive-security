import { NoticeCategory } from "@prisma/client";
import { z } from "zod";

export const CreateNoticeRequestSchema = z
  .object({
    title: z.string().min(1, "제목을 입력해주세요"),
    content: z.string().min(1, "내용을 입력해주세요"),
    category: z.nativeEnum(NoticeCategory),
    isPinned: z.boolean().optional(),
    apartmentId: z.string().min(1, "apartmentId는 필수입니다."),
    event: z
      .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.event) return;

    const start = new Date(val.event.startDate);
    const end = new Date(val.event.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "event 날짜 형식이 올바르지 않습니다.",
        path: ["event"],
      });
      return;
    }

    if (start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "시작일은 종료일보다 늦을 수 없습니다.",
        path: ["event", "startDate"],
      });
    }
  });

export type CreateNoticeRequest = z.infer<typeof CreateNoticeRequestSchema>;
