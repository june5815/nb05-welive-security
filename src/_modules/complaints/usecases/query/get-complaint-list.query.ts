import { Prisma } from "@prisma/client";
import { UserRole } from "../../../../_common/utils/token.util";

export interface ComplaintListItem {
  id: string;
  title: string;
  status: string;
  isPublic: boolean;
  viewsCount: number;
  createdAt: Date;

  user: {
    id: string;
    name: string;
  };
}

export const GetComplaintList =
  (prisma: Prisma.TransactionClient) =>
  async (props: {
    apartmentId: string;
    requesterId: string;
    requesterRole: string;
  }): Promise<ComplaintListItem[]> => {
    const isAdmin =
      props.requesterRole === UserRole.ADMIN ||
      props.requesterRole === UserRole.SUPER_ADMIN;

    return prisma.complaint.findMany({
      where: {
        apartmentId: props.apartmentId,
        ...(isAdmin
          ? {}
          : {
              OR: [{ isPublic: true }, { userId: props.requesterId }],
            }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        isPublic: true,
        viewsCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  };
