import { IApartmentQueryRepo } from "../../../_common/ports/repos/apartment/apartment-query-repo.interface";
import {
  ApartmentListResView,
  ApartmentDetailResView,
} from "../../../_modules/apartments/dtos/res/apartment.view";
import { ApartmentListQueryReq } from "../../../_modules/apartments/dtos/req/apartment.request";
import { IBaseQueryRepo } from "../_base/base-query.repo";
import { Prisma } from "@prisma/client";
import { ApartmentMapper } from "../../mappers/apartment.mapper";

export const ApartmentQueryRepo = (
  baseQueryRepo: IBaseQueryRepo,
): IApartmentQueryRepo => {
  const prismaClient = baseQueryRepo.getPrismaClient();

  const apartmentInclude = {
    admin: {
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        contact: true,
      },
    },
    household: {
      select: {
        building: true,
        unit: true,
        householdStatus: true,
      },
    },
  };

  const findApartmentList = async (
    query: ApartmentListQueryReq,
  ): Promise<ApartmentListResView> => {
    try {
      const { page, limit, searchKeyword } = query;

      // 검색 조건 구성 (name, address, officeNumber, id)
      const whereCondition: Prisma.ApartmentWhereInput = {};
      if (searchKeyword) {
        const queryMode: Prisma.QueryMode = "insensitive";
        whereCondition.OR = [
          { name: { contains: searchKeyword, mode: queryMode } },
          { address: { contains: searchKeyword, mode: queryMode } },
          { officeNumber: { contains: searchKeyword, mode: queryMode } },
        ];
      }
      const [totalCount, rawData] = await Promise.all([
        prismaClient.apartment.count({ where: whereCondition }),
        prismaClient.apartment.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereCondition,
          include: apartmentInclude,
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return ApartmentMapper.toListPresentation(
        rawData,
        totalCount,
        page,
        limit,
      );
    } catch (error) {
      throw error;
    }
  };

  const findApartmentDetailById = async (
    apartmentId: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const rawData = await prismaClient.apartment.findUnique({
        where: { id: apartmentId },
        include: apartmentInclude,
      });

      if (!rawData) return null;
      return ApartmentMapper.toDetailPresentation(rawData);
    } catch (error) {
      throw error;
    }
  };

  const findApartmentByName = async (
    name: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const queryMode: Prisma.QueryMode = "insensitive";

      const rawData = await prismaClient.apartment.findFirst({
        where: {
          name: { contains: name, mode: queryMode },
        },
        include: apartmentInclude,
      });

      if (!rawData) return null;
      return ApartmentMapper.toDetailPresentation(rawData);
    } catch (error) {
      throw error;
    }
  };

  const findApartmentByAddress = async (
    address: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const queryMode: Prisma.QueryMode = "insensitive";

      const rawData = await prismaClient.apartment.findFirst({
        where: {
          address: { contains: address, mode: queryMode },
        },
        include: apartmentInclude,
      });

      if (!rawData) return null;

      return ApartmentMapper.toDetailPresentation(rawData);
    } catch (error) {
      throw error;
    }
  };

  const findApartmentByDescription = async (
    description: string,
  ): Promise<ApartmentDetailResView[]> => {
    try {
      const queryMode: Prisma.QueryMode = "insensitive";

      const rawData = await prismaClient.apartment.findMany({
        where: {
          description: { contains: description, mode: queryMode },
        },
        include: apartmentInclude,
        orderBy: { createdAt: "desc" },
      });

      return ApartmentMapper.toDetailPresentationArray(rawData);
    } catch (error) {
      throw error;
    }
  };

  const findApartmentByOfficeNumber = async (
    officeNumber: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const queryMode: Prisma.QueryMode = "insensitive";

      const rawData = await prismaClient.apartment.findFirst({
        where: {
          officeNumber: { contains: officeNumber, mode: queryMode },
        },
        include: apartmentInclude,
      });

      if (!rawData) return null;

      return ApartmentMapper.toDetailPresentation(rawData);
    } catch (error) {
      throw error;
    }
  };

  return {
    findApartmentList,
    findApartmentDetailById,
    findApartmentByName,
    findApartmentByAddress,
    findApartmentByDescription,
    findApartmentByOfficeNumber,
  };
};
