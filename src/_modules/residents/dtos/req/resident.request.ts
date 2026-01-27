import { z } from "zod";

const PHONE_REGEX = /^(?=.*\d)[\d]/;

export const householdMembersListReqSchema = z.object({
  userId: z.string().trim().nonempty("사용자 ID가 필요합니다."),
  role: z.enum(["ADMIN"], {
    message: "관리자 권한이 필요합니다.",
  }),
  params: z.object({
    apartmentId: z.string().trim().nonempty("건물 ID가 필요합니다."),
  }),
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "페이지는 1 이상이어야 합니다.")
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "limit은 1 이상이어야 합니다.")
      .max(100, "limit은 최대 100까지 가능합니다.")
      .default(20),
    searchKeyword: z
      .string()
      .trim()
      .max(50, "검색어는 최대 50자까지 가능합니다.")
      .optional(),
    building: z.coerce
      .number()
      .int()
      .min(1, "건물 번호는 1 이상이어야 합니다.")
      .optional(),
    unit: z.coerce
      .number()
      .int()
      .min(1, "호수는 1 이상이어야 합니다.")
      .optional(),
    isHouseholder: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    isRegistered: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

export type HouseholdMembersListReqDTO = z.infer<
  typeof householdMembersListReqSchema
>;

export const householdMemberDetailReqSchema = z.object({
  userId: z.string().trim().nonempty("사용자 ID가 필요합니다."),
  role: z.enum(["ADMIN"], {
    message: "관리자 권한이 필요합니다.",
  }),
  params: z.object({
    apartmentId: z.string().trim().nonempty("건물 ID가 필요합니다."),
    householdMemberId: z.string().trim().uuid("유효한 UUID 형식이어야 합니다."),
  }),
});

export type HouseholdMemberDetailReqDTO = z.infer<
  typeof householdMemberDetailReqSchema
>;
