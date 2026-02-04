import { z } from "zod";

/**
 * 공통 User 스키마
 */
const adminUserSchema = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  apartmentId: z.string(),
});

const residentUserSchema = z.object({
  id: z.string(),
  role: z.literal("USER"),
  apartmentId: z.string(),
});

/**
 * 투표 생성
 */
export const createPollReqSchema = z.object({
  user: adminUserSchema,
  body: z.object({
    title: z.string(),
    description: z.string().optional(),
    options: z.array(z.string()).min(2),
    startAt: z.string(),
    endAt: z.string(),
    targetApartmentId: z.string(),
  }),
});

/**
 * 투표 목록
 */
export const getPollListReqSchema = z.object({
  query: z.object({
    apartmentId: z.string(),
    status: z.enum(["PENDING", "IN_PROGRESS", "CLOSED"]).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  }),
});

/**
 * 투표 상세
 */
export const getPollDetailReqSchema = z.object({
  params: z.object({
    pollId: z.string(),
  }),
});

/**
 * 투표 수정
 */
export const updatePollReqSchema = z.object({
  params: z.object({
    pollId: z.string(),
  }),
  user: adminUserSchema,
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
  }),
});

/**
 * 투표 삭제
 */
export const deletePollReqSchema = z.object({
  params: z.object({
    pollId: z.string(),
  }),
  user: adminUserSchema,
});

/**
 * 투표
 */
export const votePollReqSchema = z.object({
  params: z.object({
    pollId: z.string(),
    optionId: z.string(),
  }),
  user: residentUserSchema,
});

/**
 * 투표 취소
 */
export const cancelVotePollReqSchema = votePollReqSchema;
