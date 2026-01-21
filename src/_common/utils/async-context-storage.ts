import { AsyncLocalStorage } from "async_hooks";
import { PrismaClient } from "@prisma/client";
import { TxPrismaClient } from "./prisma-custom.types";

// 1. Storage
const storage = new AsyncLocalStorage<TxPrismaClient>();

export const asyncContextStorage = {
  run: <T>(data: TxPrismaClient, callback: () => Promise<T>) => {
    return storage.run(data, callback);
  },
  get: (): TxPrismaClient | undefined => {
    return storage.getStore();
  },
};

// 2. Transaction 실행가
export const runInTx = async <T>(
  prisma: PrismaClient,
  fn: () => Promise<T>,
) => {
  // Prisma 트랜잭션을 시작하고 생성된 tx 객체를 storage에 박제
  return prisma.$transaction(async (tx) => {
    return asyncContextStorage.run(tx as any, fn);
  });
};
