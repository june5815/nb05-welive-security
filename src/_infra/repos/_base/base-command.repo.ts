import { PrismaClient } from "@prisma/client";
import { asyncContextStorage } from "../../../_common/utils/async-context-storage";
import { TxPrismaClient } from "../../../_common/utils/prisma-custom.types";

export interface IBaseCommandRepo {
  getPrismaClient: () => PrismaClient | TxPrismaClient;
}

export const BaseCommandRepo = (
  prismaClient: PrismaClient,
): IBaseCommandRepo => {
  const getPrismaClient = (): PrismaClient | TxPrismaClient => {
    return asyncContextStorage.get() ?? prismaClient;
  };

  return {
    getPrismaClient,
  };
};
