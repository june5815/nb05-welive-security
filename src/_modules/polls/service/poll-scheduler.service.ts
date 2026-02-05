import { IPollCommandRepo } from "../ports/poll-command.repo";

export const PollScheduler = (repo: IPollCommandRepo) => {
  const run = async () => {
    const polls = await repo.findAllActive();

    for (const poll of polls) {
      if (poll.shouldStart()) await repo.markInProgress(poll.id);
      if (poll.shouldClose()) await repo.markClosed(poll.id);
    }
  };

  setInterval(run, 60000);
};
