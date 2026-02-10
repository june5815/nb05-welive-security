import { IUnitOfWork } from "../../db/u-o-w.interface";
import { IPollCommandRepo } from "../../../_modules/polls/ports/poll-command.repo";

export const PollCommandRepo = (uow: IUnitOfWork): IPollCommandRepo => {
  const prisma = uow.getClient();

  return {
    async createPoll(params) {
      const created = await uow.run(async (tx) => {
        const poll = await tx.poll.create({
          data: {
            title: params.title,
            content: params.content,
            status: "PENDING",
            startDate: params.startDate,
            endDate: params.endDate,
            apartmentId: params.apartmentId,
            building: params.building ?? null,
            userId: params.userId,
            options: {
              create: params.options.map((o, idx) => ({
                text: o.title,
                order: idx + 1,
                voteCount: 0,
              })),
            },
          },
        });

        const notice = await tx.notice.create({
          data: {
            title: `주민 투표: ${poll.title}`,
            content: `투표가 등록되었습니다.\n\n${poll.content}`,
            category: "RESIDENT_VOTE",
            type: "NORMAL",
            apartmentId: poll.apartmentId,
            userId: poll.userId,
            event: {
              create: {
                title: `투표: ${poll.title}`,
                startDate: poll.startDate,
                endDate: poll.endDate,
                apartmentId: poll.apartmentId,
                resourceType: "POLL",
              },
            },
          },
        });

        await tx.poll.update({
          where: { id: poll.id },
          data: { noticeId: notice.id },
        });

        return poll.id;
      });

      return created;
    },

    async updatePoll(params) {
      await uow.run(async (tx) => {
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

        if (params.options?.length) {
          for (const o of params.options) {
            await tx.pollOption.update({
              where: { id: o.id },
              data: { text: o.title },
            });
          }
        }

        const poll = await tx.poll.findUnique({ where: { id: params.pollId } });
        if (poll?.noticeId) {
          await tx.notice.update({
            where: { id: poll.noticeId },
            data: {
              title: `주민 투표: ${poll.title}`,
              content: `투표가 수정되었습니다.\n\n${poll.content}`,
            },
          });

          await tx.event
            .update({
              where: { noticeId: poll.noticeId },
              data: {
                title: `투표: ${poll.title}`,
                startDate: poll.startDate,
                endDate: poll.endDate,
                resourceType: "POLL",
              },
            })
            .catch(() => {});
        }
      });
    },

    async deletePoll(pollId: string) {
      await uow.run(async (tx) => {
        const poll = await tx.poll.findUnique({ where: { id: pollId } });
        if (poll?.noticeId) {
          await tx.notice
            .delete({ where: { id: poll.noticeId } })
            .catch(() => {});
        }
        await tx.poll.delete({ where: { id: pollId } });
      });
    },

    async vote(params) {
      const { pollId, optionId, userId } = params;

      await uow.run(async (tx) => {
        await tx.pollVote.create({
          data: { pollId, optionId, userId },
        });

        await tx.pollOption.update({
          where: { id: optionId },
          data: { voteCount: { increment: 1 } },
        });
      });
    },

    async cancelVote(params) {
      const { pollId, userId } = params;

      await uow.run(async (tx) => {
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

    async markInProgress(pollId: string) {
      await prisma.poll.update({
        where: { id: pollId },
        data: { status: "IN_PROGRESS" },
      });
    },

    async markClosed(pollId: string) {
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

      const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
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

        await prisma.event
          .update({
            where: { noticeId },
            data: { title: `투표 마감: ${poll.title}` },
          })
          .catch(() => {});
      } else {
        await prisma.notice.create({
          data: {
            title: `투표 마감: ${poll.title}`,
            content,
            category: "RESIDENT_VOTE",
            type: "IMPORTANT",
            apartmentId,
            userId: authorId,
            event: {
              create: {
                title: `투표 마감: ${poll.title}`,
                startDate: poll.startDate,
                endDate: poll.endDate,
                apartmentId,
                resourceType: "POLL",
              },
            },
          },
        });
      }
    },
  };
};
