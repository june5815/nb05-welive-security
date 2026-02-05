import { IPollQueryRepo } from "../../../_modules/polls/ports/poll-query.repo";
import { IUnitOfWork } from "../../db/u-o-w.interface";
import { Prisma } from "@prisma/client";

export class PollQueryRepo implements IPollQueryRepo {
  constructor(private readonly uow: IUnitOfWork) {}

  async findList(params: {
    apartmentId: string;
    status?: string;
    skip: number;
    take: number;
  }) {
    const prisma = this.uow.getClient();

    const where: Prisma.PollWhereInput = {
      apartmentId: params.apartmentId,
      ...(params.status && { status: params.status as any }),
    };

    const [polls, totalCount] = await Promise.all([
      prisma.poll.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.poll.count({ where }),
    ]);

    return { data: polls, totalCount };
  }

  async findDetail(pollId: string, userId?: string) {
    const prisma = this.uow.getClient();

    return prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
        votes: userId ? { where: { userId } } : false,
      },
    });
  }
}
