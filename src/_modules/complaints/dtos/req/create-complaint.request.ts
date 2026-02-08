import { z } from "zod";

export const createComplaintReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER"]),
  body: z.object({
    title: z.string(),
    content: z.string(),
    isPublic: z.boolean(),
  }),
  apartmentId: z.string(),
});
