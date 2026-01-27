import { RefreshToken as IRefreshToken } from "../../../_modules/auth/domain/auth.entity";
import { AuthMapper } from "../../mappers/auth.mapper";
import { IAuthCommandRepo } from "../../../_common/ports/repos/auth/auth-command-repo.interface";
import { IBaseCommandRepo } from "../_base/base-command.repo";
import { Prisma } from "@prisma/client";

export const AuthCommandRepo = (
  baseCommandRepo: IBaseCommandRepo,
): IAuthCommandRepo => {
  const upsertRefreshToken = async (
    entity: IRefreshToken,
  ): Promise<IRefreshToken> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const data = AuthMapper.toCreate(entity);

      const upsertData = await prisma.refreshToken.upsert({
        where: { userId: data.userId },
        create: {
          userId: data.userId,
          refreshToken: data.refreshToken,
        },
        update: {
          refreshToken: data.refreshToken,
        },
      });

      return AuthMapper.toEntity(upsertData);
    } catch (error) {
      throw error;
    }
  };

  const findByUserId = async (
    userId: string,
  ): Promise<IRefreshToken | null> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      const foundToken = await prisma.refreshToken.findUnique({
        where: { userId },
      });

      if (!foundToken) {
        return null;
      }

      return AuthMapper.toEntity(foundToken);
    } catch (error) {
      throw error;
    }
  };

  const deleteRefreshToken = async (userId: string): Promise<void> => {
    try {
      const prisma = baseCommandRepo.getPrismaClient();
      await prisma.refreshToken.delete({
        where: { userId },
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
    upsertRefreshToken,
    findByUserId,
    deleteRefreshToken,
  };
};
