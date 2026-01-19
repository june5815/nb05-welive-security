import { z } from "zod";
import { CommentResourceType } from "@prisma/client";

export const CreateCommentRequestSchema = z.object({
  content: z.string().min(1),
  resourceId: z.string().cuid(),
  resourceType: z.nativeEnum(CommentResourceType),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;
