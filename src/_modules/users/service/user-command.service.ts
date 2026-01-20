import {
  createUserReqDTO,
  updateAvatarReqDTO,
  updatePasswordReqDTO,
  updateAdminDataReqDTO,
  updateUserSignUpStatusReqDTO,
  updateUserListSignUpStatusReqDTO,
  deleteAdminReqDTO,
  deleteRejectedUsersReqDTO,
} from "../../../inbound/req-dto-validate/user.request";
import {
  AdminOf,
  Resident,
  User as IUser,
  UserEntity,
} from "../domain/user.entity";
import { IUserCommandRepo } from "../../../application/ports/repos/command/user-command-repo.interface";
import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../_common/utils/token.util";
import { PessimisticLock } from "../../../_common/utils/pessimistic-lock.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";

export interface IUserCommandService {
  signUpSuperAdmin: (dto: createUserReqDTO) => Promise<IUser>;
  signUpAdmin: (dto: createUserReqDTO) => Promise<IUser>;
  signUpResidentUser: (dto: createUserReqDTO) => Promise<IUser>;
  updateMyAvatar: (dto: updateAvatarReqDTO) => Promise<IUser>;
  updateMyPassword: (dto: updatePasswordReqDTO) => Promise<IUser>;
  updateAdminData: (dto: updateAdminDataReqDTO) => Promise<IUser>;
  updateAdminSignUpStatus: (
    dto: updateUserSignUpStatusReqDTO,
  ) => Promise<IUser>;
  updateAdminListSignUpStatus: (
    dto: updateUserListSignUpStatusReqDTO,
  ) => Promise<void>;
  updateResidentUserSignUpStatus: (
    dto: updateUserSignUpStatusReqDTO,
  ) => Promise<IUser>;
  updateResidentUserListSignUpStatus: (
    dto: updateUserListSignUpStatusReqDTO,
  ) => Promise<void>;
  deleteAdmin: (dto: deleteAdminReqDTO) => Promise<void>;
  deleteRejectedAdmins: (dto: deleteRejectedUsersReqDTO) => Promise<void>;
  deleteRejectedResidentUsers: (
    dto: deleteRejectedUsersReqDTO,
  ) => Promise<void>;
}

export const UserCommandService = (
  unitOfWork: IUnitOfWork,
  hashManager: IHashManager,
  userCommandRepo: IUserCommandRepo,
): IUserCommandService => {
  const handleError = (error: unknown) => {
    if (error instanceof TechnicalException) {
      if (error.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_USERNAME,
        });
      }
      if (error.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
        throw new BusinessException({
          type: BusinessExceptionType.EMAIL_DUPLICATE,
        });
      }
      if (error.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_CONTACT,
        });
      }
      if (error.type === TechnicalExceptionType.UNIQUE_VIOLATION) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_APARTMENT,
        });
      }
      if (error.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
        throw new BusinessException({
          type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
        });
      }
      if (error.type === TechnicalExceptionType.UNKNOWN_SERVER_ERROR) {
        throw new BusinessException({
          type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
        });
      }
      throw new BusinessException({
        type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
      });
    }
    throw error;
  };

  const signUpSuperAdmin = async (dto: createUserReqDTO): Promise<IUser> => {
    try {
      const { body } = dto;

      const findedUser = await userCommandRepo.findByUsername(body.username);
      if (findedUser) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_USERNAME,
        });
      }

      const createUser = await UserEntity.createSuperAdmin({
        ...body,
        hashManager,
      });

      const savedUser = await userCommandRepo.createSuperAdmin(createUser);

      return savedUser;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const signUpAdmin = async (dto: createUserReqDTO): Promise<IUser> => {
    try {
      const { body } = dto;

      const findedUser = await userCommandRepo.findByUsername(body.username);
      if (findedUser) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_USERNAME,
        });
      }

      const { resident, adminOf, ...rest } = body;
      const createUser = await UserEntity.createAdmin({
        ...rest,
        adminOf: adminOf as AdminOf,
        hashManager,
      });

      const savedUser = await userCommandRepo.createAdmin(createUser);

      return savedUser;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const signUpResidentUser = async (dto: createUserReqDTO): Promise<IUser> => {
    try {
      const { body } = dto;

      const findedUser = await userCommandRepo.findByUsername(body.username);
      if (findedUser) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_USERNAME,
        });
      }

      const { resident, adminOf, ...rest } = body;
      const createUser = await UserEntity.createResidentUser({
        ...rest,
        resident: resident as Resident,
        hashManager,
      });

      const savedUser = await userCommandRepo.createResidentUser(createUser);

      return savedUser;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateMyAvatar = async (dto: updateAvatarReqDTO): Promise<IUser> => {
    try {
      return await unitOfWork.doTx<IUser>(
        async () => {
          const { userId, role, body } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          let foundUser: IUser | null;
          if (role === "ADMIN" || role === "USER") {
            foundUser = await userCommandRepo.findById(userId);
          } else {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          if (!foundUser) {
            throw new BusinessException({
              type: BusinessExceptionType.USER_NOT_FOUND,
            });
          }

          const newAvatar =
            body.avatarImage.location ?? body.avatarImage.filename;
          const updatedUser = UserEntity.updateAvatar(foundUser, newAvatar!);

          const savedUser = await userCommandRepo.update(updatedUser);
          return savedUser;
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateMyPassword = async (
    dto: updatePasswordReqDTO,
  ): Promise<IUser> => {
    try {
      return await unitOfWork.doTx<IUser>(
        async () => {
          const { userId, role, body } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          let foundUser: IUser | null;
          if (role === "ADMIN" || role === "USER") {
            foundUser = await userCommandRepo.findById(userId);
          } else {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          if (!foundUser) {
            throw new BusinessException({
              type: BusinessExceptionType.USER_NOT_FOUND,
            });
          }

          const { password, newPassword } = body;
          const isPasswordMatched = await UserEntity.isPasswordMatched(
            foundUser,
            password,
            hashManager,
          );
          if (isPasswordMatched === false) {
            throw new BusinessException({
              type: BusinessExceptionType.INVALID_PASSWORD,
            });
          }

          const updatedUser = await UserEntity.updatePassword(
            foundUser,
            newPassword,
            hashManager,
          );

          const savedUser = await userCommandRepo.update(updatedUser);
          return savedUser;
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateAdminData = async (
    dto: updateAdminDataReqDTO,
  ): Promise<IUser> => {
    try {
      return await unitOfWork.doTx<IUser>(
        async () => {
          const { userId, role, body, params } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "SUPER_ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const foundUser = await userCommandRepo.findById(
            params.adminId,
            "update",
          );
          if (!foundUser) {
            throw new BusinessException({
              type: BusinessExceptionType.USER_NOT_FOUND,
            });
          }
          if (foundUser.role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const updatedUser = UserEntity.updateAdminInfo(foundUser, body);

          const savedUser = await userCommandRepo.update(updatedUser);
          return savedUser;
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "RepeatableRead",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateAdminSignUpStatus = async (
    dto: updateUserSignUpStatusReqDTO,
  ): Promise<IUser> => {
    try {
      return await unitOfWork.doTx<IUser>(
        async () => {
          const { userId, role, body, params } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "SUPER_ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const foundUser = await userCommandRepo.findById(
            params.adminId!,
            "update",
          );
          if (!foundUser) {
            throw new BusinessException({
              type: BusinessExceptionType.USER_NOT_FOUND,
            });
          }
          if (foundUser.role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const updatedUser =
            body.joinStatus === "APPROVED"
              ? UserEntity.approveJoin(foundUser)
              : UserEntity.rejectJoin(foundUser);

          const savedUser = await userCommandRepo.update(updatedUser);
          return savedUser;
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "RepeatableRead",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateAdminListSignUpStatus = async (
    dto: updateUserListSignUpStatusReqDTO,
  ): Promise<void> => {
    try {
      return await unitOfWork.doTx(
        async () => {
          const { userId, role, body } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "SUPER_ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          await userCommandRepo.lockManyAdmin("update");

          body.joinStatus === "APPROVED"
            ? await userCommandRepo.approveManyAdmin()
            : await userCommandRepo.rejectManyAdmin();
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "RepeatableRead",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateResidentUserSignUpStatus = async (
    dto: updateUserSignUpStatusReqDTO,
  ): Promise<IUser> => {
    try {
      return await unitOfWork.doTx<IUser>(
        async () => {
          const { userId, role, body, params } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const foundUser = await userCommandRepo.findById(
            params.residentId!,
            "update",
          );
          if (!foundUser) {
            throw new BusinessException({
              type: BusinessExceptionType.USER_NOT_FOUND,
            });
          }
          if (foundUser.role !== "USER") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const updatedUser =
            body.joinStatus === "APPROVED"
              ? UserEntity.approveJoin(foundUser)
              : UserEntity.rejectJoin(foundUser);

          const savedUser = await userCommandRepo.update(updatedUser);
          return savedUser;
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "RepeatableRead",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateResidentUserListSignUpStatus = async (
    dto: updateUserListSignUpStatusReqDTO,
  ): Promise<void> => {
    try {
      return await unitOfWork.doTx(
        async () => {
          const { userId, role, body } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          await userCommandRepo.lockManyResidentUser("update");

          body.joinStatus === "APPROVED"
            ? await userCommandRepo.approveManyResidentUser()
            : await userCommandRepo.rejectManyResidentUser();
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "RepeatableRead",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const deleteAdmin = async (dto: deleteAdminReqDTO): Promise<void> => {
    try {
      return await unitOfWork.doTx(
        async () => {
          const { userId, role, params } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "SUPER_ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          const foundUser = await userCommandRepo.findById(params.adminId);
          if (!foundUser) {
            return;
          }
          if (foundUser.role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          await userCommandRepo.deleteAdmin(params.adminId);
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "ReadCommitted",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const deleteRejectedAdmins = async (
    dto: deleteRejectedUsersReqDTO,
  ): Promise<void> => {
    try {
      return await unitOfWork.doTx(
        async () => {
          const { userId, role } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "SUPER_ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          await userCommandRepo.lockManyAdmin("update");
          await userCommandRepo.deleteManyAdmin();
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "ReadCommitted",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const deleteRejectedResidentUsers = async (
    dto: deleteRejectedUsersReqDTO,
  ): Promise<void> => {
    try {
      return await unitOfWork.doTx(
        async () => {
          const { userId, role } = dto;

          if (!userId || !role) {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (role !== "ADMIN") {
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }

          await userCommandRepo.lockManyResidentUser("update");
          await userCommandRepo.deleteManyResidentUser();
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "ReadCommitted",
          },
          useOptimisticLock: false,
        },
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return {
    signUpSuperAdmin,
    signUpAdmin,
    signUpResidentUser,
    updateMyAvatar,
    updateMyPassword,
    updateAdminData,
    updateAdminSignUpStatus,
    updateAdminListSignUpStatus,
    updateResidentUserSignUpStatus,
    updateResidentUserListSignUpStatus,
    deleteAdmin,
    deleteRejectedAdmins,
    deleteRejectedResidentUsers,
  };
};
