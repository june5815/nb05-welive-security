import { z } from "zod";

export const ApartmentListQuerySchema = z.object({
  page: z.coerce.number().int().positive("page는 양수여야 합니다").default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  searchKeyword: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type ApartmentListQueryReq = z.infer<typeof ApartmentListQuerySchema>;

export const ApartmentDetailParamSchema = z.object({
  id: z.uuid({ message: "유효한 UUID 형식이어야 합니다" }),
});

export type ApartmentDetailParamReq = z.infer<
  typeof ApartmentDetailParamSchema
>;

export const SearchApartmentByNameSchema = z.object({
  name: z.string().trim().min(1, "아파트명은 필수입니다").max(255),
});

export type SearchApartmentByNameReq = z.infer<
  typeof SearchApartmentByNameSchema
>;

export const SearchApartmentByAddressSchema = z.object({
  address: z.string().trim().min(1, "주소는 필수입니다").max(255),
});

export type SearchApartmentByAddressReq = z.infer<
  typeof SearchApartmentByAddressSchema
>;

export const SearchApartmentByDescriptionSchema = z.object({
  description: z.string().trim().min(1, "설명은 필수입니다").max(1000),
});

export type SearchApartmentByDescriptionReq = z.infer<
  typeof SearchApartmentByDescriptionSchema
>;

export const SearchApartmentByOfficeNumberSchema = z.object({
  officeNumber: z
    .string()
    .trim()
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, "유효한 전화번호 형식이어야 합니다"),
});

export type SearchApartmentByOfficeNumberReq = z.infer<
  typeof SearchApartmentByOfficeNumberSchema
>;

export const ValidateHouseholdSchema = z.object({
  building: z.number().int().positive("건물번호는 양수여야 합니다"),
  unit: z.number().int().positive("호수는 양수여야 합니다"),
});

export type ValidateHouseholdReq = z.infer<typeof ValidateHouseholdSchema>;
