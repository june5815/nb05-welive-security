import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export const JoinStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type TJoinStatus = (typeof JoinStatus)[keyof typeof JoinStatus];

export interface AdminOf {
  readonly id?: string;
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly officeNumber: string;
  readonly buildingNumberFrom: number;
  readonly buildingNumberTo: number;
  readonly floorCountPerBuilding: number;
  readonly unitCountPerFloor: number;
}

export interface Resident {
  readonly id?: string;
  readonly apartmentId: string;
  readonly building: number;
  readonly unit: number;
  readonly isHouseholder?: boolean;
}

export interface User {
  readonly id?: string;
  readonly username: string;
  readonly password: string;
  readonly email: string;
  readonly contact: string;
  readonly name: string;
  readonly role?: TUserRole;
  readonly avatar?: string;
  readonly joinStatus?: TJoinStatus;
  readonly isActive?: boolean;
  readonly refreshToken?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: number;

  readonly adminOf?: AdminOf;
  readonly resident?: Resident;
}

export const AuthEntity = {
  async updateRefreshToken(
    user: User,
    refreshToken: string,
    hashManager: IHashManager,
  ): Promise<User> {
    const hashedToken = await hashManager.hash(refreshToken);
    return {
      ...user,
      refreshToken: hashedToken,
    };
  },

  deleteRefreshToken(user: User): User {
    return {
      ...user,
      refreshToken: undefined,
    };
  },

  async isPasswordMatched(
    user: User,
    plainPassword: string,
    hashManager: IHashManager,
  ): Promise<boolean> {
    if (!user.password) return false;
    return await hashManager.compare({
      plainString: plainPassword,
      hashedString: user.password,
    });
  },

  /**
   * @error Unauthorized Exception (리프레시 토큰 미존재)
   */
  async isRefreshTokenMatched(
    user: User,
    refreshToken: string,
    hashManager: IHashManager,
  ): Promise<boolean> {
    if (!user.refreshToken) {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }
    return await hashManager.compare({
      plainString: refreshToken,
      hashedString: user.refreshToken,
    });
  },
};
