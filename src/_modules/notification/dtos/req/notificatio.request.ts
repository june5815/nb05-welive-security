import { z } from "zod";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const userIdSchema = z
  .string()
  .trim()
  .nonempty("사용자 ID는 필수입니다.")
  .regex(UUID_V4_REGEX, "유효한 사용자 ID가 아닙니다.");

export const notificationReceiptIdSchema = z
  .string()
  .trim()
  .nonempty("알림 ID는 필수입니다.")
  .regex(UUID_V4_REGEX, "유효한 알림 ID가 아닙니다.");

export const pageSchema = z.coerce
  .number()
  .int("페이지는 정수여야 합니다.")
  .min(1, "페이지는 1 이상이어야 합니다.")
  .default(1);

export const limitSchema = z.coerce
  .number()
  .int("limit은 정수여야 합니다.")
  .min(1, "limit은 1 이상이어야 합니다.")
  .max(100, "limit은 100 이하여야 합니다.")
  .default(20);

export const getUnreadNotificationsSseReqSchema = z.object({
  userId: userIdSchema,
});
export type GetUnreadNotificationsSseReq = z.infer<
  typeof getUnreadNotificationsSseReqSchema
>;

export const getNotificationListReqSchema = z.object({
  userId: userIdSchema,
  page: pageSchema,
  limit: limitSchema,
});
export type GetNotificationListReq = z.infer<
  typeof getNotificationListReqSchema
>;

export const createGetNotificationListReqSchema = z.object({
  userId: userIdSchema,
  query: z.object({
    page: pageSchema,
    limit: limitSchema,
  }),
});
export type CreateGetNotificationListReq = z.infer<
  typeof createGetNotificationListReqSchema
>;

export const markNotificationAsReadReqSchema = z.object({
  userId: userIdSchema,
  notificationReceiptId: notificationReceiptIdSchema,
});
export type MarkNotificationAsReadReq = z.infer<
  typeof markNotificationAsReadReqSchema
>;

export const createMarkNotificationAsReadReqSchema = z.object({
  userId: userIdSchema,
  params: z.object({
    notificationReceiptId: notificationReceiptIdSchema,
  }),
});
export type CreateMarkNotificationAsReadReq = z.infer<
  typeof createMarkNotificationAsReadReqSchema
>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattened = error.flatten().fieldErrors;
      const errors: Record<string, string> = {};

      Object.entries(flattened).forEach(
        ([key, messages]: [string, unknown]) => {
          const messageArray = messages as string[] | undefined;
          errors[key] = messageArray?.[0] || "검증 실패";
        },
      );

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: { _error: "검증 중 오류가 발생했습니다." },
    };
  }
}

export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ReturnType<typeof schema.safeParse> {
  return schema.safeParse(data);
}
