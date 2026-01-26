import { PrismaClient } from "@prisma/client";
import {
  IComplaintQueryRepo,
  ComplaintListResult,
} from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";
import { ComplaintMapper } from "../../mappers/complaint.mapper";

export const ComplaintQueryRepo = (
  prisma: PrismaClient,
): IComplaintQueryRepo => {
  const findById = async (id: string) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        apartment: true,
      },
    });

    if (!complaint) {
      return null;
    }

    return ComplaintMapper.toEntity(complaint);
  };

  const findMany = async (apartmentId: string) => {
    const complaints = await prisma.complaint.findMany({
      where: { apartmentId },
      include: {
        user: true,
        apartment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return complaints.map((complaint) => ComplaintMapper.toEntity(complaint));
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
        skip,
        take: limit,
        include: {
          user: true,
          apartment: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.complaint.count({
        where: { apartmentId },
      }),
    ]);

    return {
      data: data.map((complaint) => ComplaintMapper.toEntity(complaint)),
      totalCount,
    };
  };

  return {
    findById,
    findMany,
    findList,
  };
};
