import { User as IUser } from "../../../application/command/entities/user/user.entity";
import {
  UserMapper,
  superAdminInclude,
  adminInclude,
  residentInclude,
} from "../../mappers/user.mapper";
import { IUserCommandRepo } from "../../../application/ports/repos/command/user-command-repo.interface";
import { IBaseCommandRepo } from "./base-command.repo";
import { PessimisticLock } from "../../../shared/utils/pessimistic-lock.util";
import { Prisma } from "@prisma/client";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../shared/exceptions/technical.exception";

export const UserCommandRepo = (
  baseCommandRepo: IBaseCommandRepo,
): IUserCommandRepo => {
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  const createSuperAdmin = async (entity: IUser): Promise<IUser> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const savedUser = await prisma.user.create({
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
      const prisma = baseCommandRepo.getPrismaClient();
      const savedUser = await prisma.user.create({
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
      const prisma = baseCommandRepo.getPrismaClient();
      const existingResident = await prisma.resident.findUnique({
        where: {
          email_name: {
            email: entity.email,
            name: entity.name,
          },
        },
        select: {
          id: true,
        },
      });

      const savedUser = await prisma.user.create({
        data: UserMapper.toCreateUser(entity, existingResident?.id),
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

  /**
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR
   * @error UserRole이 우리가 정의한 것과 다를 때 에러 발생함
   */
  const findByUsername = async (username: string): Promise<IUser | null> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const foundUser = await prisma.user.findUnique({
        where: { username },
        include: superAdminInclude,
      });

      if (!foundUser) {
        return null;
      }

      switch (foundUser.role) {
        case "SUPER_ADMIN":
          return UserMapper.toSuperAdminEntity(foundUser);
        case "ADMIN":
          return UserMapper.toAdminEntity(foundUser);
        case "USER":
          return UserMapper.toUserEntity(foundUser);
        default:
          throw new TechnicalException({
            type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
            error: new Error(
              `해당되는 유저 타입이 없습니다. 다시 확인해주세요.`,
            ),
          });
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR
   * @error UserRole이 우리가 정의한 것과 다를 때 에러 발생함
   */
  const findById = async (
    userId: string,
    pessimisticLock?: PessimisticLock,
  ): Promise<IUser | null> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      if (pessimisticLock) {
        let query: Prisma.Sql;

        switch (pessimisticLock) {
          case "share":
            query = Prisma.sql`SELECT * FROM "User" WHERE id = ${userId} FOR SHARE`;
            break;
          case "update":
            query = Prisma.sql`SELECT * FROM "User" WHERE id = ${userId} FOR UPDATE`;
            break;
          default:
            throw new Error("유효하지 않은 잠금 타입입니다.");
        }
        await prisma.$queryRaw(query);
      }

      const foundUser = await prisma.user.findUnique({
        where: { id: userId },
        include: superAdminInclude,
      });

      if (!foundUser) {
        return null;
      }

      switch (foundUser.role) {
        case "SUPER_ADMIN":
          return UserMapper.toSuperAdminEntity(foundUser);
        case "ADMIN":
          return UserMapper.toAdminEntity(foundUser);
        case "USER":
          return UserMapper.toUserEntity(foundUser);
        default:
          throw new TechnicalException({
            type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
            error: new Error(
              `해당되는 유저 타입이 없습니다. 다시 확인해주세요.`,
            ),
          });
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   * @error TechnicalExceptionType.UNIQUE_VIOLATION (동일 아파트 단지 정보)
   * @error TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED (낙관적 락 실패)
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR (UserRole 오류 관련)
   */
  const update = async (user: IUser): Promise<IUser> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const updatedUser = await prisma.user.update({
        where: { id: user.id, version: user.version },
        data: { ...UserMapper.toUpdate(user), version: { increment: 1 } },
        include: superAdminInclude,
      });

      switch (updatedUser.role) {
        case "SUPER_ADMIN":
          return UserMapper.toSuperAdminEntity(updatedUser);
        case "ADMIN":
          return UserMapper.toAdminEntity(updatedUser);
        case "USER":
          return UserMapper.toUserEntity(updatedUser);
        default:
          throw new TechnicalException({
            type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
            error: new Error(`Unknown User Role. Please check again.`),
          });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const model = (error.meta as any)?.model;
          const target = (error.meta as any)?.target;
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
          if (
            model === "Apartment" &&
            target?.includes("name_address_officeNumber")
          ) {
            throw new TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION,
              error: error,
            });
          }
        }

        if (error.code === "P2025") {
          throw new TechnicalException({
            type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
            error: error,
          });
        }
      }

      throw error;
    }
  };

  const approveMany = async (): Promise<void> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      await prisma.user.updateMany({
        where: { joinStatus: "PENDING" },
        data: {
          joinStatus: "APPROVED",
          isActive: true,
          version: { increment: 1 },
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const rejectMany = async (): Promise<void> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      await prisma.user.updateMany({
        where: { joinStatus: "PENDING" },
        data: {
          joinStatus: "REJECTED",
          isActive: false,
          version: { increment: 1 },
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return;
      }

      throw error;
    }
  };

  return {
    createSuperAdmin,
    createAdmin,
    createResidentUser,
    findByUsername,
    findById,
    update,
    approveMany,
    rejectMany,
    deleteUser,
  };
};
