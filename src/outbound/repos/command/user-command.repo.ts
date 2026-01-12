import {
  UserEntity,
  User as IUser,
} from "../../../application/command/entities/user/user.entity";
import {
  UserMapper,
  SuperAdmin,
  Admin,
  ResidentUser,
  superAdminInclude,
  adminInclude,
  residentInclude,
} from "../../mappers/user.mapper";
import { IBaseCommandRepo } from "./base-command.repo";
import { User, Prisma } from "@prisma/client";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../shared/exceptions/technical.exception";

export const UserCommandRepo = (baseCommandRepo: IBaseCommandRepo) => {
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  const createSuperAdmin = async (entity: IUser): Promise<IUser> => {
    try {
      const savedUser = await baseCommandRepo.getPrismaClient().user.create({
        data: UserMapper.toCreateSuperAdmin(entity),
        include: superAdminInclude,
      });
      return UserMapper.toSuperAdminEntity(savedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const model = (error.meta as any)?.model;
          const target = (error.meta as any)?.target;
          if (model === "User" && target?.includes("username")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
              error: error,
            });
          }
          if (model === "User" && target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (model === "User" && target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }

          throw error;
        }
      }

      throw error;
    }
  };

  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  const createAdmin = async (entity: IUser): Promise<IUser> => {
    try {
      const savedUser = await baseCommandRepo.getPrismaClient().user.create({
        data: UserMapper.toCreateAdmin(entity),
        include: adminInclude,
      });
      return UserMapper.toAdminEntity(savedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const model = (error.meta as any)?.model;
          const target = (error.meta as any)?.target;
          if (model === "User" && target?.includes("username")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
              error: error,
            });
          }
          if (model === "User" && target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (model === "User" && target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }

          throw error;
        }
      }

      throw error;
    }
  };

  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  const createResidentUser = async (entity: IUser): Promise<IUser> => {
    try {
      const savedUser = await baseCommandRepo.getPrismaClient().user.create({
        data: UserMapper.toCreateUser(entity),
        include: residentInclude,
      });
      return UserMapper.toUserEntity(savedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const model = (error.meta as any)?.model;
          const target = (error.meta as any)?.target;
          if (model === "User" && target?.includes("username")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
              error: error,
            });
          }
          if (model === "User" && target?.includes("email")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
              error: error,
            });
          }
          if (model === "User" && target?.includes("contact")) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: error,
            });
          }

          throw error;
        }
      }

      throw error;
    }
  };

  return {
    createSuperAdmin,
    createAdmin,
    createResidentUser,
  };
};
