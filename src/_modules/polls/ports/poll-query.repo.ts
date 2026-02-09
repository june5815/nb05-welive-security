import { Prisma, PrismaClient, UserRole } from "@prisma/client";

export interface IPollQueryRepo {
  findList(params: {
    apartmentId: string;
    role: UserRole;
    userId: string;
    page: number;
    limit: number;
    searchKeyword?: string;
    status?: "PENDING" | "IN_PROGRESS" | "CLOSED";
    building?: number;
  }): Promise<{
    data: Array<{
      id: string;
      createdAt: Date;
      title: string;
      content: string;
      status: "PENDING" | "IN_PROGRESS" | "CLOSED";
      startDate: Date;
      endDate: Date;
      apartmentId: string;
      building: number;
      author: { id: string; name: string };
    }>;
    totalCount: number;
    page: number;
    limit: number;
    hasNext: boolean;
  }>;

  findDetail(params: {
    pollId: string;
    apartmentId: string;
    role: UserRole;
    userId: string;
  }): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    content: string;
    status: "PENDING" | "IN_PROGRESS" | "CLOSED";
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    author: { id: string; name: string };
    options: Array<{ id: string; title: string; voteCount: number }>;
    optionIdVotedByMe: string | null;
  } | null>;
}

const getResidentBuilding = async (prisma: PrismaClient, userId: string) => {
  const hm = await prisma.householdMember.findFirst({
    where: { userId },
    include: { household: true },
  });
  return hm?.household?.building ?? null;
};

export const PollQueryRepository = (prisma: PrismaClient): IPollQueryRepo => {
  return {
    async findList(params) {
      const skip = (params.page - 1) * params.limit;
      const take = params.limit;

      const where: Prisma.PollWhereInput = {
        apartmentId: params.apartmentId,
        ...(params.status ? { status: params.status } : {}),
      };

      if (params.searchKeyword && params.searchKeyword.trim().length > 0) {
        where.OR = [
          { title: { contains: params.searchKeyword, mode: "insensitive" } },
          { content: { contains: params.searchKeyword, mode: "insensitive" } },
        ];
      }

      if (params.building !== undefined) {
        where.building = params.building;
      }

      // USER는 (building=null 전체) 또는 (내 building만) 보게
      if (params.role === "USER") {
        const b = await getResidentBuilding(prisma, params.userId);
        where.AND = [
          ...(where.AND
            ? Array.isArray(where.AND)
              ? where.AND
              : [where.AND]
            : []),
          { OR: [{ building: null }, { building: b ?? -1 }] },
        ];
      }

      const [list, totalCount] = await Promise.all([
        prisma.poll.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          include: { user: true },
        }),
        prisma.poll.count({ where }),
      ]);

      return {
        data: list.map((p) => ({
          id: p.id,
          createdAt: p.createdAt,
          title: p.title,
          content: p.content,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          apartmentId: p.apartmentId,
          building: p.building ?? 0,
          author: { id: p.userId, name: p.user.name },
        })),
        totalCount,
        page: params.page,
        limit: params.limit,
        hasNext: skip + list.length < totalCount,
      };
    },

    async findDetail(params) {
      const poll = await prisma.poll.findUnique({
        where: { id: params.pollId },
        include: {
          user: true,
          options: { orderBy: { order: "asc" } },
          votes: { where: { userId: params.userId } }, // optionIdVotedByMe
        },
      });

      if (!poll) return null;
      if (poll.apartmentId !== params.apartmentId) return null;

      if (params.role === "USER") {
        const b = await getResidentBuilding(prisma, params.userId);
        const allowed = poll.building === null || poll.building === b;
        if (!allowed) return null;
      }

      const voted = poll.votes.length > 0 ? poll.votes[0] : null;

      return {
        id: poll.id,
        createdAt: poll.createdAt,
        title: poll.title,
        content: poll.content,
        status: poll.status,
        startDate: poll.startDate,
        endDate: poll.endDate,
        apartmentId: poll.apartmentId,
        building: poll.building ?? 0,
        author: { id: poll.userId, name: poll.user.name },
        options: poll.options.map((o) => ({
          id: o.id,
          title: o.text, // DB text -> Swagger title
          voteCount: o.voteCount,
        })),
        optionIdVotedByMe: voted?.optionId ?? null,
      };
    },
  };
};
