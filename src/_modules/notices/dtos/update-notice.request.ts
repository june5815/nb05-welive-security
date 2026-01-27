import z from "zod";
import { NoticeCategory } from "@prisma/client";

export const UpdateNoticeRequestSchema = z
  .object({
    title: z.string().min(1, "변경할 제목을 입력해주세요").optional(),
    content: z.string().min(1, "변경할 내용을 입력해주세요").optional(),
    category: z.nativeEnum(NoticeCategory).optional(),
    isPinned: z.boolean().optional(),
    event: z
      .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
      .nullable()
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.event || val.event === null) return;

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
