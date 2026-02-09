import { z } from "zod";

export const updateComplaintStatusReqSchema = z.object({
  params: z.object({
    complaintId: z.string(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]),
  }),
  userId: z.string(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  apartmentId: z.string(),
});
