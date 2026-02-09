import { IPollQueryRepo } from "../../../_modules/polls/ports/poll-query.repo";
import { IUnitOfWork } from "../../db/u-o-w.interface";
import { Prisma, UserRole } from "@prisma/client";

export class PollQueryRepo implements IPollQueryRepo {
  constructor(private readonly uow: IUnitOfWork) {}

  private async getResidentBuilding(userId: string) {
    const prisma = this.uow.getClient();
    const hm = await prisma.householdMember.findFirst({
      where: { userId },
      include: { household: true },
    });
    return hm?.household?.building ?? null;
  }

  async findList(params: {
    apartmentId: string;
    role: UserRole;
    userId: string;
    page: number;
    limit: number;
    searchKeyword?: string;
    status?: "PENDING" | "IN_PROGRESS" | "CLOSED";
    building?: number;
  }) {
    const prisma = this.uow.getClient();
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

    if (params.role === "USER") {
      const b = await this.getResidentBuilding(params.userId);
      where.AND = [{ OR: [{ building: null }, { building: b ?? -1 }] }];
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

    const data = list.map((p) => ({
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
    }));

    return {
      data,
      totalCount,
      page: params.page,
      limit: params.limit,
      hasNext: skip + list.length < totalCount,
    };
  }

  async findDetail(params: {
    pollId: string;
    apartmentId: string;
    role: UserRole;
    userId: string;
  }) {
    const prisma = this.uow.getClient();

    const poll = await prisma.poll.findUnique({
      where: { id: params.pollId },
      include: {
        user: true,
        options: { orderBy: { order: "asc" } },
        votes: { where: { userId: params.userId } },
      },
    });

    if (!poll) return null;

    if (params.role === "USER") {
      const b = await this.getResidentBuilding(params.userId);
      const allowed = poll.building === null || poll.building === b;
      if (!allowed) return null;
    }

    const voted = poll.votes?.[0] ?? null;

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
        title: o.text,
        voteCount: o.voteCount,
      })),
      optionIdVotedByMe: voted?.optionId ?? null,
    };
  }
}
