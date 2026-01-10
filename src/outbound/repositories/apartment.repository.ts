import { PrismaClient } from "@prisma/client";
import { ApartmentEntity } from "../../application/command/entities/apartment/apartment.entity";

export type ApartmentRepository = {
  readonly findAll: (
    page: number,
    limit: number,
    searchKeyword?: string,
  ) => Promise<{
    data: ApartmentEntity[];
    totalCount: number;
  }>;
  readonly findById: (id: string) => Promise<ApartmentEntity | null>;
  readonly create: (apartment: ApartmentEntity) => Promise<ApartmentEntity>;
  readonly update: (
    id: string,
    apartment: Partial<ApartmentEntity>,
  ) => Promise<ApartmentEntity>;
};

export const createApartmentRepository = (
  db: PrismaClient,
): ApartmentRepository => ({
  findAll: async (page: number, limit: number, searchKeyword?: string) => {
    const skip = (page - 1) * limit;

    const where = searchKeyword
      ? {
          OR: [
            { name: { contains: searchKeyword } },
            { address: { contains: searchKeyword } },
            { description: { contains: searchKeyword } },
            { officeNumber: { contains: searchKeyword } },
          ],
        }
      : undefined;

    const [data, totalCount] = await Promise.all([
      db.apartment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.apartment.count({ where }),
    ]);

    return {
      data: data as ApartmentEntity[],
      totalCount,
    };
  },

  findById: async (id: string) => {
    const apartment = await db.apartment.findUnique({
      where: { id },
    });
    return (apartment as ApartmentEntity | null) ?? null;
  },

  create: async (apartment: ApartmentEntity) => {
    const created = await db.apartment.create({
      data: apartment,
    });
    return created as ApartmentEntity;
  },

  update: async (id: string, apartment: Partial<ApartmentEntity>) => {
    const updated = await db.apartment.update({
      where: { id },
      data: apartment,
    });
    return updated as ApartmentEntity;
  },
});
