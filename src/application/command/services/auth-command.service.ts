import {
  LoginReqDto,
  RefreshTokenReqDto,
} from "../../../inbound/req-dto-validate/auth.request";
import {
  LoginResDto,
  TokenResDto,
  NewTokenResDto,
} from "../../../inbound/res-dto/auth/auth.response";
import { UserEntity } from "../entities/user/user.entity";
import { IUserCommandRepo } from "../../ports/repos/command/user-command-repo.interface";
import { IUnitOfWork } from "../../ports/u-o-w.interface";
import { IHashManager } from "../../ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../shared/utils/token.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../shared/exceptions/technical.exception";

export interface IAuthCommandService {
  login: (
    dto: LoginReqDto,
  ) => Promise<{ loginResDto: LoginResDto; tokenResDto: TokenResDto }>;
  logout: (refreshToken: string) => Promise<void> | void;
  refreshToken: (dto: RefreshTokenReqDto) => Promise<NewTokenResDto>;
}

export const AuthCommandService = (
  unitOfWork: IUnitOfWork,
  hashManager: IHashManager,
  tokenUtil: ITokenUtil,
  userCommandRepo: IUserCommandRepo,
): IAuthCommandService => {
  const login = async (
    dto: LoginReqDto,
  ): Promise<{ loginResDto: LoginResDto; tokenResDto: TokenResDto }> => {
    const { username, password } = dto.body;

    try {
      const { updatedUser, userId, refreshToken } = await unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findByUsername(username);
          if (
            !foundUser ||
            !(await UserEntity.isPasswordMatched(
              foundUser,
              password,
              hashManager,
            ))
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.INVALID_AUTH,
            });
          }

          if (
            foundUser.joinStatus === "PENDING" &&
            foundUser.isActive === false
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.STATUS_IS_PENDING,
            });
          }
          if (
            foundUser.joinStatus === "REJECTED" &&
            foundUser.isActive === false
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.REJECTED_USER,
            });
          }

          const refreshToken = tokenUtil.generateRefreshToken({
            userId: foundUser.id!,
          });
          const updatedUser = await UserEntity.updateRefreshToken(
            foundUser,
            refreshToken,
            hashManager,
          );
          await userCommandRepo.update(updatedUser);

          return { refreshToken, userId: updatedUser.id!, updatedUser };
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );

      const accessToken = tokenUtil.generateAccessToken({ userId });
      const csrfValue = tokenUtil.generateCsrfValue();

      const tokenResDto: TokenResDto = { accessToken, refreshToken, csrfValue };
      const loginResDto: LoginResDto = {
        id: updatedUser.id!,
        username: updatedUser.username!,
        email: updatedUser.email!,
        contact: updatedUser.contact!,
        name: updatedUser.name!,
        role: updatedUser.role!,
        avatar: updatedUser.avatar,
        joinStatus: updatedUser.joinStatus!,
        isActive: updatedUser.isActive!,
        adminOf: updatedUser.adminOf
          ? {
              id: updatedUser.adminOf.id!,
              name: updatedUser.adminOf.name,
            }
          : undefined,
        resident: updatedUser.resident
          ? {
              id: updatedUser.resident.id!,
              apartmentId: updatedUser.resident.apartmentId,
              building: updatedUser.resident.building,
              unit: updatedUser.resident.unit,
              isHouseholder: updatedUser.resident.isHouseholder!,
            }
          : undefined,
      };

      return { loginResDto, tokenResDto };
    } catch (error) {
      if (error instanceof TechnicalException) {
        if (error.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw new BusinessException({
            type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
          });
        }
      }

      throw error;
    }
  };

  const logout = (refreshToken: string): Promise<void> | void => {
    const { userId } = tokenUtil.verifyToken({
      token: refreshToken,
      type: "REFRESH",
      ignoreExpiration: true,
    });

    try {
      return unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findById(userId);
          if (
            !foundUser ||
            !(await UserEntity.isRefreshTokenMatched(
              foundUser,
              refreshToken,
              hashManager,
            ))
          ) {
            return;
          }

          const updatedUser = UserEntity.deleteRefreshToken(foundUser);
          await userCommandRepo.update(updatedUser);
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );
    } catch (error) {
      if (error instanceof TechnicalException) {
        if (error.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          return;
        }
      }

      throw error;
    }
  };

  const refreshToken = async (
    dto: RefreshTokenReqDto,
  ): Promise<NewTokenResDto> => {
    const { refreshToken: oldRefreshToken } = dto.cookie;
    const { userId } = tokenUtil.verifyToken({
      token: oldRefreshToken,
      type: "REFRESH",
    });

    try {
      const { newRefreshToken } = await unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findById(userId);
          if (
            !foundUser ||
            !(await UserEntity.isRefreshTokenMatched(
              foundUser,
              oldRefreshToken,
              hashManager,
            ))
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.INVALID_AUTH,
            });
          }

          if (
            foundUser.joinStatus === "PENDING" &&
            foundUser.isActive === false
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.STATUS_IS_PENDING,
            });
          }
          if (
            foundUser.joinStatus === "REJECTED" &&
            foundUser.isActive === false
          ) {
            throw new BusinessException({
              type: BusinessExceptionType.REJECTED_USER,
            });
          }

          const newRefreshToken = tokenUtil.generateRefreshToken({
            userId: foundUser.id!,
          });
          const updatedUser = await UserEntity.updateRefreshToken(
            foundUser,
            newRefreshToken,
            hashManager,
          );
          await userCommandRepo.update(updatedUser);

          return { newRefreshToken };
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );

      const newAccessToken = tokenUtil.generateAccessToken({ userId });
      const newCsrfValue = tokenUtil.generateCsrfValue();

      return {
        newAccessToken,
        newRefreshToken,
        newCsrfValue,
      };
    } catch (error) {
      if (error instanceof TechnicalException) {
        if (error.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw new BusinessException({
            type: BusinessExceptionType.UNKOWN_SERVER_ERROR,
          });
        }
      }

      throw error;
    }
  };

  return {
    login,
    logout,
    refreshToken,
  };
};
