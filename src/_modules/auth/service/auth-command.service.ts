import { LoginReqDto, RefreshTokenReqDto } from "../dtos/req/auth.request";
import {
  LoginResDto,
  TokenResDto,
  NewTokenResDto,
} from "../dtos/res/auth.response";
import { AuthEntity } from "../domain/auth.entity";
import { IUserCommandRepo } from "../../../_common/ports/repos/user/user-command-repo.interface";
import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../_common/utils/token.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";

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
      const { updatedUser, userId, role, refreshToken } = await unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findByUsername(username);
          if (
            !foundUser ||
            !(await AuthEntity.isPasswordMatched(
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
          const updatedUser = await AuthEntity.updateRefreshToken(
            foundUser,
            refreshToken,
            hashManager,
          );
          await userCommandRepo.update(updatedUser);

          return {
            refreshToken,
            userId: updatedUser.id!,
            role: updatedUser.role!,
            updatedUser,
          };
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );

      const accessToken = tokenUtil.generateAccessToken({ userId, role });
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
            !(await AuthEntity.isRefreshTokenMatched(
              foundUser,
              refreshToken,
              hashManager,
            ))
          ) {
            return;
          }

          const updatedUser = AuthEntity.deleteRefreshToken(foundUser);
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
      const { newRefreshToken, role } = await unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findById(userId);
          if (
            !foundUser ||
            !(await AuthEntity.isRefreshTokenMatched(
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
          const updatedUser = await AuthEntity.updateRefreshToken(
            foundUser,
            newRefreshToken,
            hashManager,
          );
          await userCommandRepo.update(updatedUser);

          return { newRefreshToken, role: foundUser.role! };
        },
        {
          transactionOptions: {
            useTransaction: false,
          },
          useOptimisticLock: true,
        },
      );

      const newAccessToken = tokenUtil.generateAccessToken({ userId, role });
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
