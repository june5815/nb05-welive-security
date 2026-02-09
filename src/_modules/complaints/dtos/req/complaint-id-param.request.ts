import { z } from "zod";

export const complaintIdParamSchema = z.object({
  params: z.object({
    complaintId: z.string(),
  }),
});
//ㅏ
