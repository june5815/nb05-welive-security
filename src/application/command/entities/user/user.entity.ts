import { IHashManager } from "../../../../application/ports/managers/hash.manager.interface.js";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../shared/exceptions/business.exception";

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
  readonly apartmentId: string;
  readonly building: number;
  readonly unit: number;
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

export const UserEntity = {
  async createSuperAdmin(props: {
    username: string;
    password: string;
    email: string;
    contact: string;
    name: string;
    hashManager: IHashManager;
  }): Promise<User> {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(rest.password);

    return {
      ...rest,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
    };
  },

  async createAdmin(props: {
    username: string;
    password: string;
    email: string;
    contact: string;
    name: string;
    hashManager: IHashManager;
    adminOf: AdminOf;
  }): Promise<User> {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(rest.password);

    return {
      ...rest,
      password: hashedPassword,
      role: UserRole.ADMIN,
      joinStatus: JoinStatus.PENDING,
      isActive: false,
    };
  },

  async createUser(props: {
    username: string;
    password: string;
    email: string;
    contact: string;
    name: string;
    hashManager: IHashManager;
    resident: Resident;
  }): Promise<User> {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(rest.password);

    return {
      ...rest,
      password: hashedPassword,
      role: UserRole.USER,
      joinStatus: JoinStatus.PENDING,
      isActive: false,
    };
  },

  approveJoin(user: User): User {
    return {
      ...user,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
    };
  },

  rejectJoin(user: User): User {
    return {
      ...user,
      joinStatus: JoinStatus.REJECTED,
      isActive: false,
    };
  },

  updateAvatar(user: User, avatar: string | null): User {
    return {
      ...user,
      avatar: avatar || undefined,
    };
  },

  updateAdminInfo(
    user: User,
    props: {
      email?: string;
      contact?: string;
      name?: string;
      adminOf?: Partial<AdminOf>;
    },
  ): User {
    let updatedUser = { ...user };
    if (props.email) {
      updatedUser = {
        ...updatedUser,
        email: props.email,
      };
    }
    if (props.contact) {
      updatedUser = {
        ...updatedUser,
        contact: props.contact,
      };
    }
    if (props.name) {
      updatedUser = {
        ...updatedUser,
        name: props.name,
      };
    }

    if (props.adminOf && user.adminOf) {
      updatedUser = {
        ...updatedUser,
        adminOf: {
          ...user.adminOf,
          ...props.adminOf,
        },
      };
    }

    return {
      ...updatedUser,
    };
  },

  async updatePassword(
    user: User,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<User> {
    const hashedPassword = await hashManager.hash(newPassword);
    return {
      ...user,
      password: hashedPassword,
    };
  },

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
        type: BusinessExceptionType.UNAUTORIZED_REQUEST,
      });
    }
    return await hashManager.compare({
      plainString: refreshToken,
      hashedString: user.refreshToken,
    });
  },
};
