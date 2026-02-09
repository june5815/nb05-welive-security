import { PrismaClient } from "@prisma/client";
import { IPollCommandRepo } from "../../../_common/ports/repos/poll/poll-command-repo.interface";
import { Poll } from "../../../_modules/polls/domain/poll.entity";
import { PollMapper } from "../../mappers/poll.mapper";

export const PollCommandRepo = (prisma: PrismaClient): IPollCommandRepo => {
  const create = async (poll: Poll): Promise<Poll> => {
    const row = await prisma.poll.create({
      data: PollMapper.toCreate(poll),
      include: {
        creator: true,    // 🔥 작성자 이름
        options: true,
      },
    });

    return PollMapper.toDomain(row);
  };

  const update = async (poll: Poll): Promise<Poll> => {
    const row = await prisma.poll.update({
      where: { id: poll.id },
      data: PollMapper.toUpdate(poll),
      include: {
        creator: true,
        options: true,
      },
    });

    return PollMapper.toDomain(row);
  };

  const deleteById = async (id: string) => {
    await prisma.poll.delete({ where: { id } });
  };

  return {
    create,
    update,
    delete: deleteById,
  };
};
