type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
type JoinStatus = "PENDING" | "APPROVED" | "REJECTED";
interface LoginResAdminOf {
  id: string;
  name: string;
}
interface LoginResResdent {
  id: string;
  apartmentId: string;
  building: number;
  unit: number;
  isHouseholder: boolean;
}

export interface LoginResDto {
  id: string;
  username: string;
  email: string;
  contact: string;
  name: string;
  role: UserRole;
  avatar?: string;
  joinStatus: JoinStatus;
  isActive: boolean;
  adminOf?: LoginResAdminOf;
  resident?: LoginResResdent;
}

export interface TokenResDto {
  accessToken: string;
  refreshToken: string;
  csrfValue: string;
}

export interface NewTokenResDto {
  newAccessToken: string;
  newRefreshToken: string;
  newCsrfValue: string;
}
