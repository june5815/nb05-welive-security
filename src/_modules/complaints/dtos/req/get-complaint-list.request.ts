import { z } from "zod";

export const getComplaintListReqSchema = z.object({
  query: z.object({
    apartmentId: z.string(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
