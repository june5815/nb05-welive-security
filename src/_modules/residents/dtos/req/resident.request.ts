import { z } from "zod";

const PHONE_REGEX = /^(?=.*\d)[\d]/;

// 등록
export const createResidentReqSchema = z.object({
  role: z.enum(["ADMIN"], { message: "관리자만 등록 가능합니다." }),
  body: z.object({
    apartmentId: z.string().trim().nonempty("아파트 ID가 필요합니다."),
    email: z
      .email("이메일 형식이 올바르지 않습니다.")
      .trim()
      .nonempty("이메일을 입력해주세요."),
    contact: z
      .string()
      .trim()
      .nonempty("연락처를 입력해주세요.")
      .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
      .regex(PHONE_REGEX, "숫자만 입력해주세요."),
    name: z.string().trim().nonempty("이름을 입력해주세요."),
    building: z.coerce
      .number()
      .int()
      .min(1, "건물번호는 1 이상이어야 합니다.")
      .max(99, "건물번호는 99 이하여야 합니다."),
    unit: z.coerce
      .number()
      .int()
      .min(1, "호수는 1 이상이어야 합니다.")
      .max(9999, "호수는 9999 이하여야 합니다."),
    isHouseholder: z.boolean().default(false),
  }),
});

export type CreateResidentReqDTO = z.infer<typeof createResidentReqSchema>;

// 조회
export const householdMembersListReqSchema = z.object({
  userId: z.string().trim().nonempty("사용자 ID가 필요합니다."),
  role: z.enum(["ADMIN"], {
    message: "관리자 권한이 필요합니다.",
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
// 상세조회
export const householdMemberDetailReqSchema = z.object({
  userId: z.string().trim().nonempty("사용자 ID가 필요합니다."),
  role: z.enum(["ADMIN"], {
    message: "관리자 권한이 필요합니다.",
  }),
  params: z.object({
    apartmentId: z.string().trim().nonempty("건물 ID가 필요합니다."),
    householdMemberId: z.uuid({ message: "유효한 UUID 형식이어야 합니다." }),
  }),
});

export type HouseholdMemberDetailReqDTO = z.infer<
  typeof householdMemberDetailReqSchema
>;

// 수정
export const updateResidentReqSchema = z.object({
  role: z.enum(["ADMIN"], { message: "관리자만 수정 가능합니다." }),
  email: z.email("이메일 형식이 올바르지 않습니다.").trim().optional(),
  contact: z
    .string()
    .trim()
    .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
    .regex(PHONE_REGEX, "숫자만 입력해주세요.")
    .optional(),
  name: z.string().trim().optional(),
  building: z.coerce
    .number()
    .int()
    .min(1, "건물번호는 1 이상이어야 합니다.")
    .max(99, "건물번호는 99 이하여야 합니다.")
    .optional(),
  unit: z.coerce
    .number()
    .int()
    .min(1, "호수는 1 이상이어야 합니다.")
    .max(9999, "호수는 9999 이하여야 합니다.")
    .optional(),
  isHouseholder: z.union([z.boolean()]).optional(),
});

export type UpdateResidentReqDTO = z.infer<typeof updateResidentReqSchema>;
