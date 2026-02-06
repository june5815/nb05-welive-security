import { LoginReqDto, RefreshTokenReqDto } from "../dtos/req/auth.request";
import {
  LoginResDto,
  TokenResDto,
  NewTokenResDto,
} from "../dtos/res/auth.response";
import { AuthEntity, RefreshToken } from "../domain/auth.entity";
// import { IAuthCommandRepo } from "../../../_common/ports/repos/auth/auth-command-repo.interface";
import { IRedisExternal } from "../../../_common/ports/externals/redis-external.interface";
import { IUserCommandRepo } from "../../../_common/ports/repos/user/user-command-repo.interface";
import { IUnitOfWork } from "../../../_common/ports/db/u-o-w.interface";
import { IHashManager } from "../../../_common/ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../_common/utils/token.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { getSSEConnectionManager } from "../../notification/infrastructure/sse";
import { NotificationMapper } from "../../../_infra/mappers/notification.mapper";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

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
  // authCommandRepo: IAuthCommandRepo,
  redisExternal: IRedisExternal,
  userCommandRepo: IUserCommandRepo,
  prismaClient: PrismaClient,
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
          // prisma로 DB에 저장하는 대신에 redis에 저장하는 걸로 대체됨
          // const tokenEntity = await AuthEntity.toCreate(
          //   foundUser.id!,
          //   refreshToken,
          //   hashManager,
          // );
          // await authCommandRepo.upsertRefreshToken(tokenEntity);

          const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7일
          await redisExternal.set(
            foundUser.id!,
            refreshToken,
            REFRESH_TOKEN_TTL,
          );

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
        if (user.role === "ADMIN") {
          return user.adminOf?.id;
        }
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
      // 알람
      if (role === "ADMIN" && apartmentId) {
        try {
          const sseManager = getSSEConnectionManager();

          const notificationReceiptId = randomUUID();
          const createdAt = new Date().toISOString();
          const notificationEventType = "ADMIN_SIGNUP_REQUESTED";

          const content = NotificationMapper.generateContent({
            type: notificationEventType,
            targetType: "APARTMENT",
            targetId: apartmentId,
            extraData: { adminName: foundUser.name, isLogin: true },
          });

          const notificationData = [
            {
              id: notificationReceiptId,
              createdAt: createdAt,
              content: content,
              isChecked: false,
            },
          ];

          const sseMessage: any = {
            type: "alarm",
            model: "request",
            data: notificationData,
            timestamp: new Date(),
          };

          const sentCount = sseManager.sendToUser(userId, sseMessage);

          const notificationEvent = await prismaClient.notificationEvent.create(
            {
              data: {
                type: notificationEventType,
                targetType: "APARTMENT",
                targetId: apartmentId,
                metadata: {
                  adminName: foundUser.name,
                },
              },
            },
          );

          try {
            await prismaClient.notificationReceipt.create({
              data: {
                id: notificationReceiptId,
                userId: userId,
                eventId: notificationEvent.id,
                isChecked: false,
                checkedAt: null,
                isHidden: false,
              },
            });
          } catch (dbError) {
            console.error(
              "[ADMIN_LOGIN] NotificationReceipt 생성 실패:",
              dbError,
            );
          }

          const dbMessage: any = {
            type: "alarm",
            model: "request",
            data: notificationData[0],
            timestamp: new Date(),
          };

          await sseManager.savePendingNotification(
            userId,
            "request",
            dbMessage,
          );
        } catch (notificationError) {
          console.error("[ADMIN_LOGIN] 알림 발송 실패:", notificationError);
        }
      }

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
          // prisma로 DB에서 찾는 로직 대신에
          // redis에서 찾는 걸로 대체됨
          // const tokenData = await authCommandRepo.findByUserId(userId);

          const tokenData = await redisExternal.get(userId);
          if (!tokenData || tokenData !== refreshToken) {
            // 이미 로그아웃 되었거나 잘못된 토큰이지만,
            // 보안상 로그아웃은 성공으로 처리하거나 에러를 던질 수 있습니다.
            // throw new BusinessException({
            //   type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
            // });
            // 우리는 그냥 성공으로 처리하기로 함
            return;
          }
          // prisma로 DB에서 파기하는 로직 대신에
          // redis에 저장된 걸 파기하는 형식으로 대체됨
          // await AuthEntity.isRefreshTokenMatched(
          //   tokenData,
          //   refreshToken,
          //   hashManager,
          // );
          // await authCommandRepo.deleteRefreshToken(userId);
          await redisExternal.del(userId);
        },
        {
          transactionOptions: {
            useTransaction: false,
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

          // prisma로 DB에서 찾는 로직 대신에
          // redis에서 찾는 걸로 대체됨
          // const tokenData = await authCommandRepo.findByUserId(userId);
          // await AuthEntity.isRefreshTokenMatched(
          //   tokenData,
          //   oldRefreshToken,
          //   hashManager,
          // );

          const tokenData = await redisExternal.get(userId);
          if (!tokenData || tokenData !== oldRefreshToken) {
            throw new BusinessException({
              type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
            });
          }

          const newRefreshToken = tokenUtil.generateRefreshToken({
            userId: foundUser.id!,
          });
          // prisma로 DB에 저장하는 대신에 redis에 저장하는 걸로 대체됨
          // const tokenEntity = await AuthEntity.toCreate(
          //   foundUser.id!,
          //   newRefreshToken,
          //   hashManager,
          // );
          // await authCommandRepo.upsertRefreshToken(tokenEntity);
          const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7일
          await redisExternal.set(
            foundUser.id!,
            newRefreshToken,
            REFRESH_TOKEN_TTL,
          );

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
