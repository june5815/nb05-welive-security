import { PrismaClient } from "@prisma/client";

export type TxPrismaClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type BasePrismaClient = PrismaClient | TxPrismaClient;
