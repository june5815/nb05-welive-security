import {
  UserEntity,
  UserRole,
  JoinStatus,
  User as IUser,
} from "../../application/command/entities/user/user.entity";
import { Prisma } from "@prisma/client";

export const superAdminInclude = Prisma.validator<Prisma.UserInclude>()({
  adminOf: true,
  resident: true,
});

export const adminInclude = Prisma.validator<Prisma.UserInclude>()({
  adminOf: true,
});

export const residentInclude = Prisma.validator<Prisma.UserInclude>()({
  resident: true,
});

export type SuperAdmin = Prisma.UserGetPayload<{
  include: typeof superAdminInclude;
}>;

export type Admin = Prisma.UserGetPayload<{
  include: typeof adminInclude;
}>;

export type ResidentUser = Prisma.UserGetPayload<{
  include: typeof residentInclude;
}>;

export const UserMapper = {
  toCreateSuperAdmin(entity: IUser): Prisma.UserCreateInput {
    return {
      username: entity.username,
      password: entity.password,
      email: entity.email,
      contact: entity.contact,
      name: entity.name,
      role: UserRole.SUPER_ADMIN,
      joinStatus: JoinStatus.APPROVED,
      isActive: true,
    };
  },

  toCreateAdmin(entity: IUser): Prisma.UserCreateInput {
    return {
      username: entity.username,
      password: entity.password,
      email: entity.email,
      contact: entity.contact,
      name: entity.name,
      role: UserRole.ADMIN,
      joinStatus: JoinStatus.PENDING,
      isActive: false,
      adminOf: {
        connectOrCreate: {
          where: {
            name_address_officeNumber: {
              name: entity.adminOf!.name,
              address: entity.adminOf!.address,
              officeNumber: entity.adminOf!.officeNumber,
            },
          },
          create: {
            name: entity.adminOf!.name,
            address: entity.adminOf!.address,
            description: entity.adminOf!.description,
            officeNumber: entity.adminOf!.officeNumber,
            buildingNumberFrom: entity.adminOf!.buildingNumberFrom,
            buildingNumberTo: entity.adminOf!.buildingNumberTo,
            floorCountPerBuilding: entity.adminOf!.floorCountPerBuilding,
            unitCountPerFloor: entity.adminOf!.unitCountPerFloor,
          },
        },
      },
    };
  },

  toCreateUser(
    entity: IUser,
    existingResidentId?: string,
  ): Prisma.UserCreateInput {
    const status = existingResidentId
      ? JoinStatus.APPROVED
      : JoinStatus.PENDING;
    const isActive = existingResidentId ? true : false;

    return {
      username: entity.username,
      password: entity.password,
      email: entity.email,
      contact: entity.contact,
      name: entity.name,
      role: UserRole.USER,
      joinStatus: status,
      isActive: isActive,
      resident: existingResidentId
        ? {
            connect: {
              id: existingResidentId,
            },
          }
        : {
            create: {
              email: entity.email,
              contact: entity.contact,
              name: entity.name,
              building: entity.resident!.building,
              unit: entity.resident!.unit,
              apartment: {
                connect: { id: entity.resident!.apartmentId },
              },
            },
          },
    };
  },

  toUpdate(entity: IUser): Prisma.UserUpdateInput {
    const updateData: Prisma.UserUpdateInput = {
      email: entity.email,
      contact: entity.contact,
      name: entity.name,
      password: entity.password,
      avatar: entity.avatar,
      joinStatus: entity.joinStatus,
      isActive: entity.isActive,
      refreshToken: entity.refreshToken,
    };

    if (entity.role === UserRole.ADMIN && entity.adminOf) {
      updateData.adminOf = {
        update: {
          name: entity.adminOf.name,
          address: entity.adminOf.address,
          officeNumber: entity.adminOf.officeNumber,
          description: entity.adminOf.description,
        },
      };
    }

    return updateData;
  },

  toSuperAdminEntity(user: SuperAdmin): IUser {
    return UserEntity.restoreSuperAdmin({
      id: user.id,
      username: user.username,
      password: user.password,
      email: user.email,
      contact: user.contact,
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? undefined,
      joinStatus: user.joinStatus,
      isActive: user.isActive,
      refreshToken: user.refreshToken ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      version: user.version,
      adminOf: user.adminOf ?? undefined,
      resident: user.resident ?? undefined,
    });
  },

  toAdminEntity(user: Admin): IUser {
    return UserEntity.restoreAdmin({
      id: user.id,
      username: user.username,
      password: user.password,
      email: user.email,
      contact: user.contact,
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? undefined,
      joinStatus: user.joinStatus,
      isActive: user.isActive,
      refreshToken: user.refreshToken ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      version: user.version,
      adminOf: user.adminOf!,
    });
  },

  toUserEntity(user: ResidentUser): IUser {
    return UserEntity.restoreUser({
      id: user.id,
      username: user.username,
      password: user.password,
      email: user.email,
      contact: user.contact,
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? undefined,
      joinStatus: user.joinStatus,
      isActive: user.isActive,
      refreshToken: user.refreshToken ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      version: user.version,
      resident: user.resident!,
    });
  },
};
