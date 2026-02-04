import { IPollCommandRepo } from "../../../_modules/polls/ports/poll-command.repo";
import { Poll } from "../../../_modules/polls/domain/poll.entity";
import { IUnitOfWork } from "../../db/u-o-w.interface";
import { PrismaClient } from "@prisma/client";

export class PollCommandRepo implements IPollCommandRepo {
  constructor(private readonly uow: IUnitOfWork) {}

  async save(poll: Poll): Promise<void> {
    await this.uow.run(async (tx: PrismaClient) => {
      await tx.poll.create({
        data: {
          id: poll.id,
          title: poll.title,
          content: poll.description,
          status: poll.status,
          endDate: poll.endAt,
          apartmentId: poll.apartmentId,
          userId: poll.createdBy,
        },
      });
    });
  }

  async update(poll: Poll): Promise<void> {
    await this.uow.run(async (tx: PrismaClient) => {
      await tx.poll.update({
        where: { id: poll.id },
        data: {
          title: poll.title,
          content: poll.description,
          status: poll.status,
          endDate: poll.endAt,
        },
      });
    });
  }

  async delete(pollId: string): Promise<void> {
    await this.uow.run(async (tx: PrismaClient) => {
      await tx.poll.delete({
        where: { id: pollId },
      });
    });
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

  async vote(pollId: string, optionId: string, userId: string): Promise<void> {
    await this.uow.run(async (tx) => {
      await tx.pollVote.create({
        data: {
          pollId,
          optionId,
          userId,
        },
      });

      await tx.pollOption.update({
        where: { id: optionId },
        data: {
          voteCount: { increment: 1 },
        },
      });
    });
  }

  async cancelVote(pollId: string, userId: string): Promise<void> {
    await this.uow.run(async (tx) => {
      const vote = await tx.pollVote.findUnique({
        where: {
          userId_pollId: {
            userId,
            pollId,
          },
        },
      });

      if (!vote) return;

      await tx.pollVote.delete({
        where: {
          userId_pollId: {
            userId,
            pollId,
          },
        },
      });

      await tx.pollOption.update({
        where: { id: vote.optionId },
        data: {
          voteCount: { decrement: 1 },
        },
      });
    });
  }
}
