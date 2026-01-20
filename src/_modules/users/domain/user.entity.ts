import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";

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

  async createResidentUser(props: {
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

  restoreSuperAdmin(props: User): User {
    return { ...props };
  },

  restoreAdmin(props: {
    id: string;
    username: string;
    password: string;
    email: string;
    contact: string;
    name: string;
    role: TUserRole;
    avatar?: string;
    joinStatus: TJoinStatus;
    isActive: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    adminOf: AdminOf;
  }): User {
    return { ...props };
  },

  restoreResidentUser(props: {
    id: string;
    username: string;
    password: string;
    email: string;
    contact: string;
    name: string;
    role: TUserRole;
    avatar?: string;
    joinStatus: TJoinStatus;
    isActive: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    resident: Resident;
  }): User {
    return { ...props };
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
    let newAdminOf = user.adminOf;
    if (props.adminOf && user.adminOf) {
      newAdminOf = {
        ...user.adminOf,
        ...props.adminOf,
      };
    }

    return {
      ...user,
      email: props.email ?? user.email,
      contact: props.contact ?? user.contact,
      name: props.name ?? user.name,
      adminOf: newAdminOf,
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
};
