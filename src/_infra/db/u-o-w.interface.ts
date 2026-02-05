import { PrismaClient } from "@prisma/client";

export interface IUnitOfWork {
  run<T>(work: (tx: PrismaClient) => Promise<T>): Promise<T>;

  getClient(): PrismaClient;
}
