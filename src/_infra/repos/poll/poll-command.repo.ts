import { IUnitOfWork } from "../../db/u-o-w.interface";
import { IPollCommandRepo } from "../../../_modules/polls/ports/poll-command.repo";
import { Poll } from "../../../_modules/polls/domain/poll.entity";
import { PollOption } from "../../../_modules/polls/domain/poll-option.entity";

export const PollCommandRepo = (uow: IUnitOfWork): IPollCommandRepo => {
  const prisma = uow.getClient();

  return {
    async save(poll: Poll) {
      await prisma.poll.create({
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
    },

    async saveWithOptions(poll: Poll, options: PollOption[]) {
      await uow.run(async (tx) => {
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

        await tx.pollOption.createMany({
          data: options.map((o) => ({
            id: o.id,
            pollId: o.pollId,
            text: o.text,
            order: o.order,
          })),
        });
      });
    },

    async findById(id: string) {
      const p = await prisma.poll.findUnique({ where: { id } });
      if (!p) return null;

      return new Poll(
        p.id,
        p.apartmentId,
        p.title,
        p.content,
        p.status,
        p.endDate!,
        { type: "ALL" },
        p.userId,
        p.createdAt,
        p.updatedAt,
      );
    },

    async update(poll: Poll) {
      await prisma.poll.update({
        where: { id: poll.id },
        data: {
          title: poll.title,
          content: poll.description,
          endDate: poll.endAt,
        },
      });
    },

    async delete(id: string) {
      await prisma.poll.delete({ where: { id } });
    },

    async vote(pollId, optionId, userId) {
      await prisma.pollVote.create({ data: { pollId, optionId, userId } });
    },

    async cancelVote(pollId, userId) {
      await prisma.pollVote.delete({
        where: { userId_pollId: { pollId, userId } },
      });
    },

    async findAllActive() {
      const list = await prisma.poll.findMany({
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      });

      return list.map(
        (p) =>
          new Poll(
            p.id,
            p.apartmentId,
            p.title,
            p.content,
            p.status,
            p.endDate!,
            { type: "ALL" },
            p.userId,
            p.createdAt,
            p.updatedAt,
          ),
      );
    },

    async markInProgress(id) {
      await prisma.poll.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    },

    async markClosed(id) {
      await prisma.poll.update({
        where: { id },
        data: { status: "CLOSED" },
      });
    },
  };
};
