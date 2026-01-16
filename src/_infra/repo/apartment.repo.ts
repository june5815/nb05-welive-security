import { Apartment, Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { TxPrismaClient } from "../../_common/utils/prisma-custom.types";

export interface IApartmentRepo {
  findById(id: string): Promise<Apartment | null>;
  findByName(name: string): Promise<Apartment | null>;
  findByAddress(address: string): Promise<Apartment | null>;
  findAll(): Promise<Apartment[]>;
  create(data: Prisma.ApartmentCreateInput): Promise<Apartment>;
  updateById(id: string, data: Prisma.ApartmentUpdateInput): Promise<Apartment>;
  deleteById(id: string): Promise<void>;
  findByAdminId(adminId: string): Promise<Apartment | null>;
}

export const ApartmentRepo = (
  prisma: PrismaClient | TxPrismaClient,
): IApartmentRepo => {
  const findById = async (id: string): Promise<Apartment | null> => {
    return await prisma.apartment.findUnique({
      where: { id },
    });
  };

  const findByName = async (name: string): Promise<Apartment | null> => {
    return await prisma.apartment.findFirst({
      where: { name },
    });
  };

  const findByAddress = async (address: string): Promise<Apartment | null> => {
    return await prisma.apartment.findFirst({
      where: { address },
    });
  };

  const findAll = async (): Promise<Apartment[]> => {
    return await prisma.apartment.findMany({
      orderBy: { createdAt: "desc" },
    });
  };

  const create = async (
    data: Prisma.ApartmentCreateInput,
  ): Promise<Apartment> => {
    return await prisma.apartment.create({
      data,
    });
  };

  const updateById = async (
    id: string,
    data: Prisma.ApartmentUpdateInput,
  ): Promise<Apartment> => {
    return await prisma.apartment.update({
      where: { id },
      data,
    });
  };

  const deleteById = async (id: string): Promise<void> => {
    await prisma.apartment.delete({
      where: { id },
    });
  };

  const findByAdminId = async (adminId: string): Promise<Apartment | null> => {
    return await prisma.apartment.findFirst({
      where: { adminId },
    });
  };

  return {
    findById,
    findByName,
    findByAddress,
    findAll,
    create,
    updateById,
    deleteById,
    findByAdminId,
  };
};
