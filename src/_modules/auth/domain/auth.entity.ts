import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { User as IUser } from "../../users/domain/user.entity";

export interface RefreshToken {
  readonly refreshToken: string;
  readonly userId: string;
  readonly updatedAt?: Date;
}

export const AuthEntity = {
  async toCreate(
    userId: string,
    plainRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<RefreshToken> {
    const hashedToken = await hashManager.hash(plainRefreshToken);

    return {
      userId: userId,
      refreshToken: hashedToken,
    };
  },

  async isPasswordMatched(
    user: IUser,
    plainPassword: string,
    hashManager: IHashManager,
  ): Promise<boolean> {
    if (!user.password) {
      return false;
    }

    return await hashManager.compare({
      plainString: plainPassword,
      hashedString: user.password,
    });
  },

  /**
   * @error Unauthorized Exception (리프레시 토큰 미존재)
   */
  async isRefreshTokenMatched(
    tokenData: RefreshToken | null,
    plainRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<boolean> {
    if (!tokenData?.refreshToken) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }

    return await hashManager.compare({
      plainString: plainRefreshToken,
      hashedString: tokenData.refreshToken,
    });
  },
};
