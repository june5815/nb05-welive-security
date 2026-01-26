import { z } from "zod";

export const createComplaintReqSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    isPublic: z.boolean(),
    apartmentId: z.string(),
  }),
});
