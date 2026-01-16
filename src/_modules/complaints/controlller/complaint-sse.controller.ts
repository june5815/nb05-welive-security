import { Request, Response } from "express";
import { registerClient } from "../../events/service/complaint-notification.service";

export const complaintSSEController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.sendStatus(401);
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  res.write("event: connected\n");
  res.write("data: SSE connected\n\n");

  registerClient(userId, res);
};
