import {
  UserEntity,
  UserRole,
  JoinStatus,
  AdminOf,
  Resident,
  User as IUser,
} from "../../application/command/entities/user/user.entity";
import { User, Prisma } from "@prisma/client";

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

  // toCreateAdmin(entity: IUser): Prisma.UserCreateInput {
  //   return {
  //     username: entity.username,
  //     password: entity.password,
  //     email: entity.email,
  //     contact: entity.contact,
  //     name: entity.name,
  //     role: UserRole.ADMIN,
  //     joinStatus: JoinStatus.PENDING,
  //     isActive: false,
  //     adminOf: {
  //       create: {
  //         name: entity.adminOf!.name,
  //         address: entity.adminOf!.address,
  //         description: entity.adminOf!.description,
  //         officeNumber: entity.adminOf!.officeNumber,
  //         buildingNumberFrom: entity.adminOf!.buildingNumberFrom,
  //         buildingNumberTo: entity.adminOf!.buildingNumberTo,
  //         floorCountPerBuilding: entity.adminOf!.floorCountPerBuilding,
  //         unitCountPerFloor: entity.adminOf!.unitCountPerFloor,
  //       },
  //     },
  //   };
  // },

  // toCreateUser(entity: IUser): Prisma.UserCreateInput {
  //   return {
  //     username: entity.username,
  //     password: entity.password,
  //     email: entity.email,
  //     contact: entity.contact,
  //     name: entity.name,
  //     role: UserRole.USER,
  //     joinStatus: JoinStatus.PENDING,
  //     isActive: false,
  //     resident: {
  //       connect: {
  //         apartmentId: entity.resident!.apartmentId,
  //         building: entity.resident!.building,
  //         unit: entity.resident!.unit,
  //       },
  //     },
  //   };
  // },
};
