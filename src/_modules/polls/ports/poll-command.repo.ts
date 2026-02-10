import { PrismaClient } from "@prisma/client";

export interface IPollCommandRepo {
  createPoll(params: {
    title: string;
    content: string;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building?: number;
    userId: string;
    options: { title: string }[];
  }): Promise<string>;

  updatePoll(params: {
    pollId: string;
    title?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    building?: number | null;
    options?: { id: string; title: string }[];
  }): Promise<void>;

  deletePoll(pollId: string): Promise<void>;

  vote(params: {
    pollId: string;
    optionId: string;
    userId: string;
  }): Promise<void>;
  cancelVote(params: { pollId: string; userId: string }): Promise<void>;

  markInProgress(pollId: string): Promise<void>;
  markClosed(pollId: string): Promise<void>;
  upsertPollResultNotice(params: {
    pollId: string;
    apartmentId: string;
    authorId: string;
    noticeId?: string | null;
  }): Promise<void>;
}

export const PollCommandRepository = (
  prisma: PrismaClient,
): IPollCommandRepo => {
  return {
    async createPoll(params) {
      const created = await prisma.$transaction(async (tx) => {
        const poll = await tx.poll.create({
          data: {
            title: params.title,
            content: params.content,
            startDate: params.startDate,
            endDate: params.endDate,
            apartmentId: params.apartmentId,
            building: params.building ?? null,
            userId: params.userId,
            status: "PENDING",
            options: {
              create: params.options.map((o, idx) => ({
                text: o.title, // swagger title -> db text
                order: idx + 1,
              })),
            },
          },
        });
        return poll;
      });

      return created.id;
    },

    async updatePoll(params) {
      await prisma.$transaction(async (tx) => {
        await tx.poll.update({
          where: { id: params.pollId },
          data: {
            ...(params.title !== undefined ? { title: params.title } : {}),
            ...(params.content !== undefined
              ? { content: params.content }
              : {}),
            ...(params.startDate !== undefined
              ? { startDate: params.startDate }
              : {}),
            ...(params.endDate !== undefined
              ? { endDate: params.endDate }
              : {}),
            ...(params.building !== undefined
              ? { building: params.building }
              : {}),
          },
        });

        if (params.options) {
          for (const o of params.options) {
            await tx.pollOption.update({
              where: { id: o.id },
              data: { text: o.title },
            });
          }
        }
      });
    },

    async deletePoll(pollId) {
      await prisma.poll.delete({ where: { id: pollId } });
    },

    async vote({ pollId, optionId, userId }) {
      await prisma.$transaction(async (tx) => {
        await tx.pollVote.create({ data: { pollId, optionId, userId } });
        await tx.pollOption.update({
          where: { id: optionId },
          data: { voteCount: { increment: 1 } },
        });
      });
    },

    async cancelVote({ pollId, userId }) {
      await prisma.$transaction(async (tx) => {
        const vote = await tx.pollVote.findUnique({
          where: { userId_pollId: { userId, pollId } },
        });
        if (!vote) return;

        await tx.pollVote.delete({
          where: { userId_pollId: { userId, pollId } },
        });

        await tx.pollOption.update({
          where: { id: vote.optionId },
          data: { voteCount: { decrement: 1 } },
        });
      });
    },

    async markInProgress(pollId) {
      await prisma.poll.update({
        where: { id: pollId },
        data: { status: "IN_PROGRESS" },
      });
    },

    async markClosed(pollId) {
      await prisma.poll.update({
        where: { id: pollId },
        data: { status: "CLOSED" },
      });
    },

    async upsertPollResultNotice({ pollId, apartmentId, authorId, noticeId }) {
      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: { options: { orderBy: { order: "asc" } } },
      });
      if (!poll) return;

      const totalVotes = poll.options.reduce((s, o) => s + o.voteCount, 0);
      const lines = poll.options
        .map((o) => `- ${o.text}: ${o.voteCount}표`)
        .join("\n");

      const content = [
        `투표가 마감되었습니다.`,
        ``,
        `제목: ${poll.title}`,
        `내용: ${poll.content}`,
        ``,
        `총 투표수: ${totalVotes}`,
        ``,
        `결과:`,
        lines,
      ].join("\n");

      if (noticeId) {
        await prisma.notice.update({
          where: { id: noticeId },
          data: {
            title: `투표 마감: ${poll.title}`,
            content,
            category: "RESIDENT_VOTE",
            type: "IMPORTANT",
          },
        });
        return;
      }

      await prisma.notice.create({
        data: {
          title: `투표 마감: ${poll.title}`,
          content,
          category: "RESIDENT_VOTE",
          type: "IMPORTANT",
          apartmentId,
          userId: authorId,
        },
      });
    },
  };
};
