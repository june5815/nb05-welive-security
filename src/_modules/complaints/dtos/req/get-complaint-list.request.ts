import { z } from "zod";

export const getComplaintListReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  query: z.object({
    apartmentId: z.string(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]).optional(),
    isPublic: z.coerce.boolean().optional(),
    searchKeyword: z.string().optional(),
  }),
});
