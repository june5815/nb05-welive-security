import type { Request, Response } from "express";
import { createComment } from "../../application/command/entities/comment/create-comment";
import { updateComment } from "../../application/command/entities/comment/update-comment";
import { deleteComment } from "../../application/command/entities/comment/delete-comment";
import { getComments } from "../../application/query/comment/get-comments.query";

export const CommentController = (deps: { commentRepo: any }) => ({
  async create(req: Request, res: Response) {
    const user = req.user!;
    const { content, noticeId } = req.body;

    const result = await createComment(
      { commentRepo: deps.commentRepo },
      { content, noticeId, userId: user.id },
    );

    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const { noticeId } = req.query as { noticeId: string };

    const result = await getComments(
      { commentRepo: deps.commentRepo },
      { noticeId },
    );

    res.json(result);
  },

  async update(req: Request, res: Response) {
    const user = req.user!;
    const { commentId } = req.params;
    const { content } = req.body;

    await updateComment(
      { commentRepo: deps.commentRepo },
      { commentId, content, userId: user.id, role: user.role },
    );

    res.status(204).send();
  },

  async delete(req: Request, res: Response) {
    const user = req.user!;
    const { commentId } = req.params;

    await deleteComment(
      { commentRepo: deps.commentRepo },
      { commentId, userId: user.id, role: user.role },
    );

    res.status(204).send();
  },
});
