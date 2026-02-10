import { z } from "zod";

export const getComplaintListReqSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  query: z.object({
    apartmentId: z.string(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]).optional(),
    isPublic: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => {
        if (typeof val === "boolean") return val;
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
    searchKeyword: z.string().optional(),
  }),
});
