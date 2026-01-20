import { z } from "zod";
import { CommentResourceType } from "@prisma/client";

export const GetCommentListRequestSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  resourceId: z.string().min(1),
  resourceType: z.nativeEnum(CommentResourceType),
});
