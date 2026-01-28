import { PrismaClient } from "@prisma/client";
import {
  ComplaintListResult,
  IComplaintQueryRepo,
} from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";

export const ComplaintQueryRepo = (
  prisma: PrismaClient,
): IComplaintQueryRepo => {
  const findById = async (id: string) => {
    return prisma.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        apartment: true,
      },
    });
  };

  const findMany = async (apartmentId: string) => {
    return prisma.complaint.findMany({
      where: { apartmentId },
      include: {
        user: true,
        apartment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  const findList = async (params: {
    apartmentId: string;
    page: number;
    limit: number;
  }): Promise<ComplaintListResult> => {
    const { apartmentId, page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      prisma.complaint.findMany({
        where: { apartmentId },
        include: {
          user: true,
          apartment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.complaint.count({
        where: { apartmentId },
      }),
    ]);

    return {
      data,
      totalCount,
    };
  };

  return {
    findById,
    findMany,
    findList,
  };
};
