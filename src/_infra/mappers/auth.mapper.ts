import { RefreshToken as IRefreshToken } from "../../_modules/auth/domain/auth.entity";
import { RefreshToken as PrismaRefreshToken } from "@prisma/client";

export const AuthMapper = {
  toCreate(entity: IRefreshToken): IRefreshToken {
    return {
      refreshToken: entity.refreshToken,
      userId: entity.userId,
    };
  },

  toEntity(refreshToken: PrismaRefreshToken): IRefreshToken {
    return {
      refreshToken: refreshToken.refreshToken,
      userId: refreshToken.userId,
      updatedAt: refreshToken.updatedAt,
    };
  },
};
