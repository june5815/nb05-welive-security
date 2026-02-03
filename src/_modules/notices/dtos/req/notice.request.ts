import { z } from "zod";
import { NoticeCategory } from "@prisma/client";

const eventSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .superRefine((val, ctx) => {
    const start = new Date(val.startDate);
    const end = new Date(val.endDate);
    if (start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "시작일은 종료일보다 늦을 수 없습니다.",
        path: ["startDate"],
      });
    }
  });

export const createNoticeBodySchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  category: z.nativeEnum(NoticeCategory),
  isPinned: z.boolean().optional().default(false),

  apartmentId: z.string().uuid(),

  event: eventSchema.nullable().optional(),
});

// 2. 공지 목록 조회 (GET List)
export const getNoticeListReqSchema = z.object({
  userApartmentId: z.string().uuid(),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(20),
    category: z.nativeEnum(NoticeCategory).optional(),
    searchKeyword: z.string().optional(),
  }),
});

// 3. 공지 상세 조회 (GET Detail)
export const getNoticeDetailReqSchema = z.object({
  params: z.object({
    noticeId: z.string().uuid(),
  }),
});

// 4. 공지 수정 (PATCH)
export const updateNoticeReqSchema = z.object({
  params: z.object({
    noticeId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.nativeEnum(NoticeCategory).optional(),
    isPinned: z.boolean().optional(),
    event: eventSchema.nullable().optional(),
  }),
});

// 5. 공지 삭제 (DELETE)
export const deleteNoticeReqSchema = z.object({
  params: z.object({
    noticeId: z.string().uuid(),
  }),
});

export type CreateNoticeBodyDto = z.infer<typeof createNoticeBodySchema>;
export type GetNoticeListReqDto = z.infer<typeof getNoticeListReqSchema>;
export type GetNoticeDetailReqDto = z.infer<typeof getNoticeDetailReqSchema>;
export type UpdateNoticeReqDto = z.infer<typeof updateNoticeReqSchema>;
export type DeleteNoticeReqDto = z.infer<typeof deleteNoticeReqSchema>;
