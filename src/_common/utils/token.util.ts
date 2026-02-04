import jwt, { TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";
import {
  BusinessException,
  BusinessExceptionType,
} from "../exceptions/business.exception";
import { IConfigUtil } from "./config.util";

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export type AccessTokenPayload = {
  userId: string;
  role: TUserRole;
  apartmentId?: string;
  exp?: number;
};
export type RefreshTokenPayload = {
  userId: string;
  exp?: number;
};

export type TokenType = "ACCESS" | "REFRESH";

export interface ITokenUtil {
  generateAccessToken(payload: Omit<AccessTokenPayload, "exp">): string;

  generateRefreshToken(payload: Omit<RefreshTokenPayload, "exp">): string;

  generateCsrfValue(): string;

  verifyToken(params: {
    token: string;
    type: TokenType;
    ignoreExpiration?: boolean;
  }): AccessTokenPayload | RefreshTokenPayload;
}

export const TokenUtil = (config: IConfigUtil): ITokenUtil => {
  const generateAccessToken = (
    payload: Omit<AccessTokenPayload, "exp">,
  ): string => {
    return jwt.sign(payload, config.parsed().ACCESS_TOKEN_SECRET, {
      expiresIn: config.parsed().ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  const generateRefreshToken = (
    payload: Omit<RefreshTokenPayload, "exp">,
  ): string => {
    return jwt.sign(payload, config.parsed().REFRESH_TOKEN_SECRET, {
      expiresIn: config.parsed().REFRESH_TOKEN_EXPIRES_IN,
    });
  };

  const generateCsrfValue = (): string => {
    return crypto.randomBytes(16).toString("hex");
  };

  const verifyToken = (params: {
    token: string;
    type: TokenType;
    ignoreExpiration?: boolean;
  }): AccessTokenPayload | RefreshTokenPayload => {
    try {
      const { token, type, ignoreExpiration } = params;

      const secret =
        type === "ACCESS"
          ? config.parsed().ACCESS_TOKEN_SECRET
          : config.parsed().REFRESH_TOKEN_SECRET;

      return jwt.verify(token, secret, {
        ignoreExpiration,
      }) as AccessTokenPayload | RefreshTokenPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException({
          type: BusinessExceptionType.TOKEN_EXPIRED,
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BusinessException({
          type: BusinessExceptionType.INVALID_TOKEN,
        });
      }

      throw error;
    }
  };

  return {
    generateAccessToken,
    generateRefreshToken,
    generateCsrfValue,
    verifyToken,
  };
};
