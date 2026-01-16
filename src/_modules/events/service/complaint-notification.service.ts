import { Response } from "express";

type SSEClient = {
  userId: string;
  res: Response;
};

const clients: SSEClient[] = [];

export const registerClient = (userId: string, res: Response) => {
  clients.push({ userId, res });

  res.on("close", () => {
    const index = clients.findIndex(
      (client) => client.userId === userId && client.res === res,
    );
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
};

export const sendNotification = (
  userId: string,
  event: string,
  data: unknown,
) => {
  clients
    .filter((client) => client.userId === userId)
    .forEach((client) => {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

export const broadcastToAdmins = (
  adminIds: string[],
  event: string,
  data: unknown,
) => {
  adminIds.forEach((adminId) => sendNotification(adminId, event, data));
};
