export const getComments = async (
  deps: {
    commentRepo: {
      findMany(params: { noticeId: string }): Promise<any[]>;
    };
  },
  input: { noticeId: string },
) => {
  return deps.commentRepo.findMany({
    noticeId: input.noticeId,
  });
};
