import { PrismaClient } from "@prisma/client";
import {
  ComplaintListResult,
  IComplaintQueryRepo,
} from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";
import {
  complaintInclude,
  ComplaintMapper,
} from "../../mappers/complaint.mapper";

export const ComplaintQueryRepo = (
  prisma: PrismaClient,
): IComplaintQueryRepo => {
  const findById = async (id: string) => {
    const model = await prisma.complaint.findUnique({
      where: { id },
      include: complaintInclude,
    });
    return model ? ComplaintMapper.toEntity(model) : null;
  };

  const findDetailForUser = async ({
    complaintId,
    requesterId,
    isAdmin,
    apartmentId,
  }: {
    complaintId: string;
    requesterId: string;
    isAdmin: boolean;
    apartmentId: string;
  }) => {
    const model = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: complaintInclude,
    });

    if (!model) {
      return null;
    }

    if (model.apartmentId !== apartmentId) {
      return null;
    }

    if (!isAdmin && !model.isPublic && model.userId !== requesterId) {
      return null;
    }

    return model;
  };

  const findListForUser = async ({
    apartmentId,
    requesterId,
    isAdmin,
    page,
    limit,
    status,
    isPublic,
  }: {
    apartmentId: string;
    requesterId: string;
    isAdmin: boolean;
    page: number;
    limit: number;
    status?: "PENDING" | "IN_PROGRESS" | "RESOLVED";
    isPublic?: boolean;
  }): Promise<ComplaintListResult> => {
    const skip = (page - 1) * limit;

    let where: any;

    if (isAdmin) {
      where = {
        apartmentId,
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
      };
    } else {
      if (isPublic !== undefined) {
        if (isPublic) {
          where = {
            apartmentId,
            isPublic: true,
            ...(status && { status }),
          };
        } else {
          where = {
            apartmentId,
            isPublic: false,
            userId: requesterId,
            ...(status && { status }),
          };
        }
      } else {
        where = {
          apartmentId,
          ...(status && { status }),
          OR: [{ isPublic: true }, { userId: requesterId }],
        };
      }
    }

    const [data, totalCount] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: complaintInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      data,
      totalCount,
    };
  };

  const increaseViews = async (id: string) => {
    await prisma.complaint.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  };

  return {
    findById,
    findDetailForUser,
    findListForUser,
    increaseViews,
  };
};
