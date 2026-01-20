import path from "path";
import { z } from "zod";

const PHONE_REGEX = /^(?=.*\d)[\d]/;
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/;

// 유저 생성
export const adminOfSchema = z.object({
  name: z.string().trim().nonempty("아파트명을 입력해주세요."),
  address: z.string().trim().nonempty("아파트 주소를 입력해주세요."),
  description: z.string().trim().nonempty("아파트 소개를 입력해주세요."),
  officeNumber: z
    .string()
    .trim()
    .nonempty("관리소 번호를 입력해주세요.")
    .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
    .regex(PHONE_REGEX, "숫자만 입력해주세요. 하이픈(-)은 제외해주세요."),
  buildingNumberFrom: z.coerce.number().default(1),
  buildingNumberTo: z
    .string()
    .trim()
    .nonempty("동을 입력해주세요.")
    .transform((v) => Number(v))
    .pipe(
      z
        .number({
          message: "동은 0으로 시작할 수 없고 숫자만 입력 가능합니다.",
        })
        .int()
        .min(1, "동은 0으로 시작할 수 없고 숫자만 입력 가능합니다.")
        .max(99, "동은 두 자리까지만 입력 가능합니다."),
    ),
  floorCountPerBuilding: z
    .string()
    .trim()
    .nonempty("층을 입력해주세요.")
    .transform((v) => Number(v))
    .pipe(
      z
        .number({
          message: "동은 0으로 시작할 수 없고 숫자만 입력 가능합니다.",
        })
        .int()
        .min(1, "층은 0으로 시작할 수 없고 숫자만 입력 가능합니다.")
        .max(99, "층은 두 자리까지만 입력 가능합니다."),
    ),
  unitCountPerFloor: z
    .string()
    .trim()
    .nonempty("호를 입력해주세요.")
    .transform((v) => Number(v))
    .pipe(
      z
        .number({
          message: "호는 0으로 시작할 수 없고 숫자만 입력 가능합니다.",
        })
        .int()
        .min(1, "호는 0으로 시작할 수 없고 숫자만 입력 가능합니다.")
        .max(99, "호는 두 자리까지만 입력 가능합니다."),
    ),
});

export const residentSchema = z.object({
  apartmentId: z.string().trim().nonempty("아파트 명칭을 확인해주세요."),
  building: z
    .string()
    .trim()
    .nonempty("동을 입력해주세요.")
    .transform((v) => Number(v))
    .pipe(
      z
        .number({
          message: "동은 0으로 시작할 수 없고 숫자만 입력 가능합니다.",
        })
        .int()
        .min(1, "동은 0으로 시작할 수 없고 숫자만 입력 가능합니다.")
        .max(99, "동은 두 자리까지만 입력 가능합니다."),
    ),
  unit: z
    .string()
    .trim()
    .nonempty("호를 입력해주세요.")
    .transform((v) => Number(v))
    .pipe(
      z
        .number({
          message: "호는 0으로 시작할 수 없고 숫자만 입력 가능합니다.",
        })
        .int()
        .min(1, "호는 0으로 시작할 수 없고 숫자만 입력 가능합니다.")
        .max(99, "호는 두 자리까지만 입력 가능합니다."),
    ),
});

export const createUserReqSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .nonempty("아이디를 입력해주세요.")
      .min(5, "아이디는 최소 5자 이상입니다.")
      .max(30, "아이디는 최대 30자까지 가능합니다."),
    email: z
      .email("이메일 형식으로 작성해 주세요.")
      .trim()
      .nonempty("이메일을 입력해주세요."),
    contact: z
      .string()
      .trim()
      .nonempty("연락처를 입력해주세요.")
      .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
      .regex(PHONE_REGEX, "숫자만 입력해주세요. 하이픈(-)은 제외해주세요."),
    name: z.string().trim().nonempty("이름을 입력해주세요."),
    password: z
      .string()
      .trim()
      .nonempty("비밀번호를 입력해주세요.")
      .min(8, "비밀번호는 최소 8자 이상입니다.")
      .regex(PASSWORD_REGEX, "영문, 숫자, 특수문자를 모두 포함해야 합니다."),
    adminOf: adminOfSchema.optional(),
    resident: residentSchema.optional(),
  }),
});
export type createUserReqDTO = z.infer<typeof createUserReqSchema>;

// 내 프로필 조회
export const getMyProfileReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["ADMIN", "USER"]),
});
export type getMyProfileReqDTO = z.infer<typeof getMyProfileReqSchema>;

// 관리자 조회
export const getAdminReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN"]),
  params: z.object({
    adminId: z.string().trim().nonempty(),
  }),
});
export type getAdminReqDTO = z.infer<typeof getAdminReqSchema>;

// 관리자 목록 조회
export const getAdminListReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN"]),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).default(11),
    searchKeyword: z.string().trim().optional(),
    joinStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),
});
export type getAdminListReqDTO = z.infer<typeof getAdminListReqSchema>;

// 주민 목록 조회
export const getResidentUserListReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["ADMIN"]),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).default(11),
    searchKeyword: z.string().trim().optional(),
    joinStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    building: z.coerce.number().int().min(1).optional(),
    unit: z.coerce.number().int().min(1).optional(),
  }),
});
export type getResidentUserListReqDTO = z.infer<
  typeof getResidentUserListReqSchema
>;

// 프로필 이미지 변경
export const avatarUploadSchema = z.object({
  originalname: z.string(),
  mimetype: z.string(),
  size: z.coerce
    .number()
    .min(1)
    .max(5 * 1024 * 1024, "파일 크기는 최대 5MB까지 가능합니다."),
  path: z.string().optional(),
  filename: z.string().optional(),
  location: z.string().optional(),
});

export const updateAvatarReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["ADMIN", "USER"]),
  body: z.object({
    avatarImage: avatarUploadSchema,
  }),
});
export type updateAvatarReqDTO = z.infer<typeof updateAvatarReqSchema>;

// 비밀번호 변경
export const updatePasswordReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["ADMIN", "USER"]),
  body: z.object({
    password: z.string().trim().nonempty("현재 비밀번호를 입력해주세요."),
    newPassword: z
      .string()
      .trim()
      .nonempty("새 비밀번호를 입력해주세요.")
      .min(8, "비밀번호는 최소 8자 이상입니다.")
      .regex(PASSWORD_REGEX, "영문, 숫자, 특수문자를 모두 포함해야 합니다."),
  }),
});
export type updatePasswordReqDTO = z.infer<typeof updatePasswordReqSchema>;

// 관리자 정보 변경
export const updateAdminOfSchema = z.object({
  name: z.string().trim().nonempty("아파트명을 입력해주세요.").optional(),
  address: z.string().trim().nonempty("주소를 입력해주세요.").optional(),
  description: z
    .string()
    .trim()
    .nonempty("아파트 소개를 입력해주세요.")
    .optional(),
  officeNumber: z
    .string()
    .trim()
    .nonempty("관리소 번호를 입력해주세요.")
    .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
    .regex(PHONE_REGEX, "숫자만 입력해주세요. 하이픈(-)은 제외해주세요.")
    .optional(),
});

export const updateAdminDataReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN"]),
  params: z.object({
    adminId: z.string().trim().nonempty(),
  }),
  body: z.object({
    email: z
      .email("이메일 형식이 올바르지 않습니다.")
      .trim()
      .nonempty("이메일 형식이 올바르지 않습니다.")
      .optional(),
    contact: z
      .string()
      .trim()
      .nonempty("연락처를 입력해주세요.")
      .max(11, "전화번호는 최대 11자리까지만 입력 가능합니다.")
      .regex(PHONE_REGEX, "숫자만 입력해주세요. 하이픈(-)은 제외해주세요.")
      .optional(),
    name: z.string().trim().nonempty("관리자명을 입력해주세요.").optional(),
    adminOf: updateAdminOfSchema.optional(),
  }),
});
export type updateAdminDataReqDTO = z.infer<typeof updateAdminDataReqSchema>;

// 가입 승인 상태 변경
export const updateUserSignUpStatusReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
  params: z.object({
    adminId: z.string().trim().optional(),
    residentId: z.string().trim().optional(),
  }),
  body: z.object({
    joinStatus: z.enum(["APPROVED", "REJECTED"], {
      message:
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
    }),
  }),
});
export type updateUserSignUpStatusReqDTO = z.infer<
  typeof updateUserSignUpStatusReqSchema
>;

export const updateUserListSignUpStatusReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
  body: z.object({
    joinStatus: z.enum(["APPROVED", "REJECTED"], {
      message:
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
    }),
  }),
});
export type updateUserListSignUpStatusReqDTO = z.infer<
  typeof updateUserListSignUpStatusReqSchema
>;

// 관리자 삭제
export const deleteAdminReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN"]),
  params: z.object({
    adminId: z.string().trim().nonempty(),
  }),
});
export type deleteAdminReqDTO = z.infer<typeof deleteAdminReqSchema>;

// 가입 요청 거절 인원들 삭제
export const deleteRejectedUsersReqSchema = z.object({
  userId: z.string().trim().nonempty(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});
export type deleteRejectedUsersReqDTO = z.infer<
  typeof deleteRejectedUsersReqSchema
>;
