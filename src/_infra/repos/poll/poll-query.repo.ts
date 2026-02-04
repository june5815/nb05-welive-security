import { IPollQueryRepo } from "../../../_modules/polls/ports/poll-query.repo";
import { Poll } from "../../../_modules/polls/domain/poll.entity";
import { IUnitOfWork } from "../../db/u-o-w.interface";
import { Prisma, PollStatus } from "@prisma/client";

export class PollQueryRepo implements IPollQueryRepo {
  constructor(private readonly uow: IUnitOfWork) {}

  async findList(params: {
    apartmentId: string;
    status?: PollStatus;
    keyword?: string;
    skip: number;
    take: number;
  }): Promise<{ data: Poll[]; totalCount: number }> {
    const prisma = this.uow.getClient();

    const where: Prisma.PollWhereInput = {
      apartmentId: params.apartmentId,
      ...(params.status && { status: params.status }),
      ...(params.keyword && {
        OR: [
          {
            title: {
              contains: params.keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            content: {
              contains: params.keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
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

    return {
      data: polls.map(
        (poll) =>
          new Poll(
            poll.id,
            poll.apartmentId,
            poll.title,
            poll.content,
            poll.status,
            poll.createdAt,
            poll.endDate!,
            { type: "ALL" },
            poll.userId,
            poll.createdAt,
            poll.updatedAt,
          ),
      ),
      totalCount,
    };
  }

  async findById(pollId: string): Promise<Poll | null> {
    const prisma = this.uow.getClient();

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) return null;

    return new Poll(
      poll.id,
      poll.apartmentId,
      poll.title,
      poll.content,
      poll.status,
      poll.createdAt,
      poll.endDate!,
      { type: "ALL" },
      poll.userId,
      poll.createdAt,
      poll.updatedAt,
    );
  }
}
