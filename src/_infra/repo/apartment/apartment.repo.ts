import { PrismaClient } from "@prisma/client";
import { IApartmentRepo } from "../../../_common/ports/repos/apartment/apartment-repo.interface";
import { Apartment } from "../../../_modules/apartments/domain/apartment.entity";

const mapApartmentToDomain = (raw: any): Required<Apartment> => {
  const mapped: any = {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    description: raw.description,
    officeNumber: raw.officeNumber,
    adminId: raw.adminId,
    buildingNumberFrom: raw.buildingNumberFrom,
    buildingNumberTo: raw.buildingNumberTo,
    floorCountPerBuilding: raw.floorCountPerBuilding,
    unitCountPerFloor: raw.unitCountPerFloor,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    version: raw.version,
  };
  return mapped as Required<Apartment>;
};

const mapApartmentToPersistence = (apartment: Apartment): any => ({
  id: apartment.id,
  name: apartment.name,
  address: apartment.address,
  description: apartment.description,
  officeNumber: apartment.officeNumber,
  adminId: apartment.adminId,
  buildingNumberFrom: apartment.buildingNumberFrom,
  buildingNumberTo: apartment.buildingNumberTo,
  floorCountPerBuilding: apartment.floorCountPerBuilding,
  unitCountPerFloor: apartment.unitCountPerFloor,
  createdAt: apartment.createdAt,
  updatedAt: apartment.updatedAt,
  version: apartment.version,
});

const buildSearchWhere = (search?: string) => {
  return search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { address: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
};

const findAll = async (
  prisma: PrismaClient,
): Promise<Required<Apartment>[]> => {
  const apartments = await prisma.apartment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return apartments.map(mapApartmentToDomain);
};

const findById = async (
  prisma: PrismaClient,
  id: string,
): Promise<Required<Apartment> | null> => {
  const apartment = await prisma.apartment.findUnique({
    where: { id },
  });
  return apartment ? mapApartmentToDomain(apartment) : null;
};

const search = async (
  prisma: PrismaClient,
  query: string,
): Promise<Required<Apartment>[]> => {
  const where = buildSearchWhere(query);
  const apartments = await prisma.apartment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return apartments.map(mapApartmentToDomain);
};

const findByAddress = async (
  prisma: PrismaClient,
  address: string,
): Promise<Required<Apartment> | null> => {
  const apartment = await prisma.apartment.findFirst({
    where: { address },
  });
  return apartment ? mapApartmentToDomain(apartment) : null;
};

const findByAdminId = async (
  prisma: PrismaClient,
  adminId: string,
): Promise<Required<Apartment> | null> => {
  const apartment = await prisma.apartment.findUnique({
    where: { adminId },
  });
  return apartment ? mapApartmentToDomain(apartment) : null;
};

const findWithPagination = async (
  prisma: PrismaClient,
  page: number,
  limit: number,
): Promise<{
  data: Required<Apartment>[];
  total: number;
  page: number;
  limit: number;
}> => {
  const skip = page * limit;

  const [apartments, total] = await Promise.all([
    prisma.apartment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.apartment.count(),
  ]);

  return {
    data: apartments.map(mapApartmentToDomain),
    total,
    page,
    limit,
  };
};

const save = async (
  prisma: PrismaClient,
  apartment: Apartment,
): Promise<Required<Apartment>> => {
  const data = mapApartmentToPersistence(apartment);

  const raw = apartment.id
    ? await prisma.apartment.update({
        where: { id: apartment.id },
        data,
      })
    : await prisma.apartment.create({
        data: {
          name: apartment.name,
          address: apartment.address,
          description: apartment.description,
          officeNumber: apartment.officeNumber,
          ...(apartment.adminId && { adminId: apartment.adminId }),
          buildingNumberFrom: apartment.buildingNumberFrom,
          buildingNumberTo: apartment.buildingNumberTo,
          floorCountPerBuilding: apartment.floorCountPerBuilding,
          unitCountPerFloor: apartment.unitCountPerFloor,
        } as any,
      });

  return mapApartmentToDomain(raw);
};

const deleteApartment = async (
  prisma: PrismaClient,
  id: string,
): Promise<void> => {
  await prisma.apartment.delete({
    where: { id },
  });
};

export const createApartmentRepo = (prisma: PrismaClient): IApartmentRepo => ({
  findAll: () => findAll(prisma),
  findById: (id: string) => findById(prisma, id),
  search: (query: string) => search(prisma, query),
  findByAddress: (address: string) => findByAddress(prisma, address),
  findByAdminId: (adminId: string) => findByAdminId(prisma, adminId),
  findWithPagination: (page: number, limit: number) =>
    findWithPagination(prisma, page, limit),
  save: (apartment: Apartment) => save(prisma, apartment),
  delete: (id: string) => deleteApartment(prisma, id),
});

export type { IApartmentRepo };
