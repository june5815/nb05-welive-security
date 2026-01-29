import { z } from "zod";
import { CommentResourceType } from "@prisma/client";

// 1. 댓글 생성 (POST)
export const createCommentReqSchema = z.object({
  userId: z.string().uuid(),
  body: z.object({
    content: z.string().min(1, "내용을 입력해주세요"),
    resourceId: z.string().uuid(),
    resourceType: z.nativeEnum(CommentResourceType),
  }),
});

// 2. 댓글 목록 조회 (GET List)
export const getCommentListReqSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    resourceId: z.string().uuid("리소스 ID가 올바르지 않습니다"),
    resourceType: z.nativeEnum(CommentResourceType),
  }),
});

// 3. 댓글 수정 (PATCH)
export const updateCommentReqSchema = z.object({
  userId: z.string().uuid(),
  params: z.object({
    commentId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1, "수정할 내용을 입력해주세요"),
  }),
});

// 4. 댓글 삭제 (DELETE)
export const deleteCommentReqSchema = z.object({
  userId: z.string().uuid(),
  role: z.string(),
  params: z.object({
    commentId: z.string().uuid(),
  }),
});

export type CreateCommentReqDto = z.infer<typeof createCommentReqSchema>;
export type GetCommentListReqDto = z.infer<typeof getCommentListReqSchema>;
export type UpdateCommentReqDto = z.infer<typeof updateCommentReqSchema>;
export type DeleteCommentReqDto = z.infer<typeof deleteCommentReqSchema>;
