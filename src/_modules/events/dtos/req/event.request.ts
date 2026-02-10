import { z } from "zod";

export const getEventListReqSchema = z.object({
  query: z.object({
    apartmentId: z.string().uuid("올바른 아파트 ID가 아닙니다."),
    year: z.coerce.number().min(2000).max(2100),
    month: z.coerce.number().min(1).max(12),
  }),
});

export type GetEventListReqDto = z.infer<typeof getEventListReqSchema>;
