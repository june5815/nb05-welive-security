import { PrismaClient } from "@prisma/client";

export interface IBaseQueryRepo {
  getPrismaClient: () => PrismaClient;
}

export const BaseQueryRepo = (prismaClient: PrismaClient): IBaseQueryRepo => {
  const getPrismaClient = (): PrismaClient => {
    return prismaClient;
  };

  return {
    getPrismaClient,
  };
};
