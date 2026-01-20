import { z } from "zod";

export const UpdateCommentRequestSchema = z.object({
  content: z.string().min(1),
});

export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;
