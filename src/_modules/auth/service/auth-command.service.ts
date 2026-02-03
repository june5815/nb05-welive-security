import { LoginReqDto, RefreshTokenReqDto } from "../dtos/req/auth.request";
import {
  LoginResDto,
  TokenResDto,
  NewTokenResDto,
} from "../dtos/res/auth.response";
import { AuthEntity } from "../domain/auth.entity";
import { IAuthCommandRepo } from "../../../_common/ports/repos/auth/auth-command-repo.interface";
import { IUserCommandRepo } from "../../../_common/ports/repos/user/user-command-repo.interface";
import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../_common/utils/token.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

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
  authCommandRepo: IAuthCommandRepo,
  userCommandRepo: IUserCommandRepo,
): IAuthCommandService => {
  const login = async (
    dto: LoginReqDto,
  ): Promise<{ loginResDto: LoginResDto; tokenResDto: TokenResDto }> => {
    const { username, password } = dto.body;

    try {
      const { foundUser, userId, role, refreshToken } = await unitOfWork.doTx(
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
          const tokenEntity = await AuthEntity.toCreate(
            foundUser.id!,
            refreshToken,
            hashManager,
          );
          await authCommandRepo.upsertRefreshToken(tokenEntity);

          return {
            refreshToken,
            userId: foundUser.id!,
            role: foundUser.role!,
            foundUser,
          };
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "ReadCommitted",
          },
          useOptimisticLock: false,
        },
      );
      const resolveApartmentId = (user: any): string | undefined => {
        if (!user) return undefined;
        if (user.role === "ADMIN") return user.adminOf?.id;
        if (user.role === "USER") return user.resident?.household?.apartmentId;
        return undefined;
      };

      const apartmentId = resolveApartmentId(foundUser);
      const accessToken = tokenUtil.generateAccessToken({
        userId,
        role,
        apartmentId,
      });
      const csrfValue = tokenUtil.generateCsrfValue();

      const tokenResDto: TokenResDto = { accessToken, refreshToken, csrfValue };
      const loginResDto: LoginResDto = {
        id: foundUser.id!,
        username: foundUser.username!,
        email: foundUser.email!,
        contact: foundUser.contact!,
        name: foundUser.name!,
        role: foundUser.role!,
        avatar: foundUser.avatar,
        joinStatus: foundUser.joinStatus!,
        isActive: foundUser.isActive!,
        adminOf: foundUser.adminOf
          ? {
              id: foundUser.adminOf.id!,
              name: foundUser.adminOf.name,
            }
          : undefined,
        resident: foundUser.resident
          ? {
              id: foundUser.resident.id!,
              apartmentId: foundUser.resident.household.apartmentId,
              building: foundUser.resident.household.building,
              unit: foundUser.resident.household.unit,
              isHouseholder: foundUser.resident.isHouseholder!,
            }
          : undefined,
      };

      return { loginResDto, tokenResDto };
    } catch (error) {
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
          const tokenData = await authCommandRepo.findByUserId(userId);

          await AuthEntity.isRefreshTokenMatched(
            tokenData,
            refreshToken,
            hashManager,
          );

          await authCommandRepo.deleteRefreshToken(userId);
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

    const resolveApartmentId = (user: any): string | undefined => {
      if (!user) return undefined;
      if (user.role === "ADMIN") return user.adminOf?.id;
      if (user.role === "USER") return user.resident?.household?.apartmentId;
      return undefined;
    };

    try {
      const { newRefreshToken, role, apartmentId } = await unitOfWork.doTx(
        async () => {
          const foundUser = await userCommandRepo.findById(userId, "update");
          if (!foundUser) {
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

          const tokenData = await authCommandRepo.findByUserId(userId);
          await AuthEntity.isRefreshTokenMatched(
            tokenData,
            oldRefreshToken,
            hashManager,
          );

          const newRefreshToken = tokenUtil.generateRefreshToken({
            userId: foundUser.id!,
          });
          const tokenEntity = await AuthEntity.toCreate(
            foundUser.id!,
            newRefreshToken,
            hashManager,
          );
          await authCommandRepo.upsertRefreshToken(tokenEntity);

          return {
            newRefreshToken,
            role: foundUser.role!,
            apartmentId: resolveApartmentId(foundUser),
          };
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: "ReadCommitted",
          },
          useOptimisticLock: false,
        },
      );

      const newAccessToken = tokenUtil.generateAccessToken({
        userId,
        role,
        apartmentId,
      });
      const newCsrfValue = tokenUtil.generateCsrfValue();

      return {
        newAccessToken,
        newRefreshToken,
        newCsrfValue,
      };
    } catch (error) {
      throw error;
    }
  };

  return {
    login,
    logout,
    refreshToken,
  };
};
