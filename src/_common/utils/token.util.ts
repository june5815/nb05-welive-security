import jwt, { TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";
import {
  BusinessException,
  BusinessExceptionType,
} from "../exceptions/business.exception";
import { IConfigUtil } from "./config.util";

export type TokenPayload = {
  userId: string;
  exp?: number;
};

export type TokenType = "ACCESS" | "REFRESH";

export interface ITokenUtil {
  generateAccessToken(payload: Omit<TokenPayload, "exp">): string;

  generateRefreshToken(payload: Omit<TokenPayload, "exp">): string;

  generateCsrfValue(): string;

  verifyToken(params: {
    token: string;
    type: TokenType;
    ignoreExpiration?: boolean;
  }): TokenPayload;
}

export const TokenUtil = (config: IConfigUtil): ITokenUtil => {
  const generateAccessToken = (payload: Omit<TokenPayload, "exp">): string => {
    return jwt.sign(payload, config.parsed().ACCESS_TOKEN_SECRET, {
      expiresIn: config.parsed().ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  const generateRefreshToken = (payload: Omit<TokenPayload, "exp">): string => {
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
  }): TokenPayload => {
    try {
      const { token, type, ignoreExpiration } = params;

      const secret =
        type === "ACCESS"
          ? config.parsed().ACCESS_TOKEN_SECRET
          : config.parsed().REFRESH_TOKEN_SECRET;

      return jwt.verify(token, secret, {
        ignoreExpiration,
      }) as TokenPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException({
          type: BusinessExceptionType.TOKEN_EXPIRED,
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
