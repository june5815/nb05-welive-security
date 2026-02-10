import { z } from "zod";

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
 * Swagger: POST /api/v2/polls
 * body: { title, content, startDate, endDate, apartmentId, building, options[{title}] }
 */
export const createPollReqSchema = z.object({
  user: adminUserSchema,
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    apartmentId: z.string().uuid(),
    building: z.number().int().nullable().optional(),
    options: z.array(z.object({ title: z.string().min(1) })).min(2),
  }),
});

/**
 * Swagger: GET /api/v2/polls
 * query: { page, limit, searchKeyword, status, building }
 */
export const getPollListReqSchema = z.object({
  user: z.object({
    id: z.string(),
    role: z.enum(["ADMIN", "SUPER_ADMIN", "USER"]),
    apartmentId: z.string(),
  }),
  query: z.object({
    page: z.coerce.number().int().optional().default(1),
    limit: z.coerce.number().int().optional().default(20),
    searchKeyword: z.string().optional().default(""),
    status: z.enum(["PENDING", "IN_PROGRESS", "CLOSED"]).optional(),
    building: z.coerce.number().int().optional(),
  }),
});

/**
 * Swagger: GET /api/v2/polls/{pollId}
 */
export const getPollDetailReqSchema = z.object({
  user: z.object({
    id: z.string(),
    role: z.enum(["ADMIN", "SUPER_ADMIN", "USER"]),
    apartmentId: z.string(),
  }),
  params: z.object({
    pollId: z.string().uuid(),
  }),
});

/**
 * Swagger: PATCH /api/v2/polls/{pollId}
 * body: { title, content, startDate, endDate, building, options[{id,title}] }
 */
export const updatePollReqSchema = z.object({
  user: adminUserSchema,
  params: z.object({
    pollId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    building: z.number().int().nullable().optional(),
    options: z
      .array(
        z.object({
          id: z.string().uuid(),
          title: z.string().min(1),
        }),
      )
      .optional(),
  }),
});

/**
 * Swagger: DELETE /api/v2/polls/{pollId}
 */
export const deletePollReqSchema = z.object({
  user: adminUserSchema,
  params: z.object({
    pollId: z.string().uuid(),
  }),
});

/**
 * Swagger: POST /api/v2/polls/{pollId}/options/{optionId}/vote
 */
export const votePollReqSchema = z.object({
  user: residentUserSchema,
  params: z.object({
    pollId: z.string().uuid(),
    optionId: z.string().uuid(),
  }),
});

export const cancelVotePollReqSchema = votePollReqSchema;

export type CreatePollReqDto = z.infer<typeof createPollReqSchema>;
export type GetPollListReqDto = z.infer<typeof getPollListReqSchema>;
export type GetPollDetailReqDto = z.infer<typeof getPollDetailReqSchema>;
export type UpdatePollReqDto = z.infer<typeof updatePollReqSchema>;
export type DeletePollReqDto = z.infer<typeof deletePollReqSchema>;
export type VotePollReqDto = z.infer<typeof votePollReqSchema>;
export type CancelVotePollReqDto = z.infer<typeof cancelVotePollReqSchema>;
