import { Apartment, Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { TxPrismaClient } from "../../../_common/utils/prisma-custom.types";
import { ApartmentMapper } from "../../mapper/apartment.mapper";

export interface IApartmentRepo {
  findById(id: string): Promise<Apartment | null>;
  findByName(name: string): Promise<Apartment | null>;
  findByAddress(address: string): Promise<Apartment | null>;
  findAll(): Promise<Apartment[]>;
  create(data: Prisma.ApartmentCreateInput): Promise<Apartment>;
  updateById(id: string, data: Prisma.ApartmentUpdateInput): Promise<Apartment>;
  deleteById(id: string): Promise<void>;
  findByAdminId(adminId: string): Promise<Apartment | null>;
  search(query: string): Promise<Apartment[]>;
  findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: Apartment[];
    total: number;
    page: number;
    limit: number;
  }>;
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

  const search = async (query: string): Promise<Apartment[]> => {
    return await prisma.apartment.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  };

  const findWithPagination = async (
    page: number,
    limit: number,
  ): Promise<{
    data: Apartment[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const skip = page * limit;
    const [data, total] = await Promise.all([
      prisma.apartment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.apartment.count(),
    ]);

    return { data, total, page, limit };
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
    search,
    findWithPagination,
  };
};
