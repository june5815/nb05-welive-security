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

export const createSuperAdmin = async (props: {
  username: string;
  password: string;
  email: string;
  contact: string;
  name: string;
  hashManager: IHashManager;
}): Promise<User> => {
  const { hashManager, ...rest } = props;
  const hashedPassword = await hashManager.hash(rest.password);

  return {
    ...rest,
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
    joinStatus: JoinStatus.APPROVED,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createAdmin = async (props: {
  username: string;
  password: string;
  email: string;
  contact: string;
  name: string;
  hashManager: IHashManager;
  adminOf: AdminOf;
}): Promise<User> => {
  const { hashManager, ...rest } = props;
  const hashedPassword = await hashManager.hash(rest.password);

  return {
    ...rest,
    password: hashedPassword,
    role: UserRole.ADMIN,
    joinStatus: JoinStatus.PENDING,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createUser = async (props: {
  username: string;
  password: string;
  email: string;
  contact: string;
  name: string;
  hashManager: IHashManager;
  resident: Resident;
}): Promise<User> => {
  const { hashManager, ...rest } = props;
  const hashedPassword = await hashManager.hash(rest.password);

  return {
    ...rest,
    password: hashedPassword,
    role: UserRole.USER,
    joinStatus: JoinStatus.PENDING,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const approveJoin = (user: User): User => ({
  ...user,
  joinStatus: JoinStatus.APPROVED,
  isActive: true,
  updatedAt: new Date(),
});

export const rejectJoin = (user: User): User => ({
  ...user,
  joinStatus: JoinStatus.REJECTED,
  isActive: false,
  updatedAt: new Date(),
});

export const updateAvatar = (user: User, avatar: string | null): User => ({
  ...user,
  avatar: avatar || undefined,
  updatedAt: new Date(),
});

export const updateAdminInfo = (
  user: User,
  props: {
    email?: string;
    contact?: string;
    name?: string;
    adminOf?: Partial<AdminOf>;
  },
): User => {
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
    updatedAt: new Date(),
  };
};

export const updatePassword = async (
  user: User,
  newPassword: string,
  hashManager: IHashManager,
): Promise<User> => {
  const hashedPassword = await hashManager.hash(newPassword);
  return {
    ...user,
    password: hashedPassword,
    updatedAt: new Date(),
  };
};

export const updateRefreshToken = async (
  user: User,
  refreshToken: string,
  hashManager: IHashManager,
): Promise<User> => {
  const hashedToken = await hashManager.hash(refreshToken);
  return {
    ...user,
    refreshToken: hashedToken,
    updatedAt: new Date(),
  };
};

export const deleteRefreshToken = (user: User): User => ({
  ...user,
  refreshToken: undefined,
  updatedAt: new Date(),
});

export const isPasswordMatched = async (
  user: User,
  plainPassword: string,
  hashManager: IHashManager,
): Promise<boolean> => {
  if (!user.password) return false;
  return await hashManager.compare({
    plainString: plainPassword,
    hashedString: user.password,
  });
};

/**
 * @error Unauthorized Exception (리프레시 토큰 미존재)
 */
export const isRefreshTokenMatched = async (
  user: User,
  refreshToken: string,
  hashManager: IHashManager,
): Promise<boolean> => {
  if (!user.refreshToken) {
    throw new BusinessException({
      type: BusinessExceptionType.UNAUTORIZED_REQUEST,
    });
  }
  return await hashManager.compare({
    plainString: refreshToken,
    hashedString: user.refreshToken,
  });
};
