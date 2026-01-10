import { AsyncLocalStorage } from "async_hooks";
import { TxPrismaClient } from "./prisma-custom.types";

export const AsyncContextStorage = () => {
  const storage = new AsyncLocalStorage<TxPrismaClient>();

  const run = async <T>(data: TxPrismaClient, callback: () => Promise<T>) => {
    return storage.run(data, callback);
  };

  const get = (): TxPrismaClient | undefined => {
    return storage.getStore();
  };

  return {
    run,
    get,
  };
};

export const asyncContextStorage = AsyncContextStorage();
