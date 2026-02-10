import { PrismaClient } from "@prisma/client";
import { IPollCommandRepo } from "../ports/poll-command.repo";

export const PollScheduler = (prisma: PrismaClient, repo: IPollCommandRepo) => {
  const run = async () => {
    const now = new Date();

    const shouldStart = await prisma.poll.findMany({
      where: { status: "PENDING", startDate: { lte: now } },
    });
    for (const p of shouldStart) {
      await repo.markInProgress(p.id);
    }

    const shouldClose = await prisma.poll.findMany({
      where: { status: "IN_PROGRESS", endDate: { lte: now } },
    });

    for (const p of shouldClose) {
      await repo.markClosed(p.id);

      await repo.upsertPollResultNotice({
        pollId: p.id,
        apartmentId: p.apartmentId,
        authorId: p.userId,
        noticeId: p.noticeId,
      });
    }
  };

  setInterval(run, 60_000);
};
