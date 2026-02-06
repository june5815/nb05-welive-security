import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { INotificationQueryUsecase } from "./usecases/notification-query.usecase";
import { INotificationCommandUsecase } from "./usecases/notification-command.usecase";
import {
  getUnreadNotificationsSseReqSchema,
  createGetNotificationListReqSchema,
  createMarkNotificationAsReadReqSchema,
} from "./dtos/req/notification.request";
import {
  getSSEConnectionManager,
  SSEClientConnection,
  SSEMessage,
} from "./infrastructure/sse";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export interface INotificationController {
  getUnreadNotificationsSse: (req: Request, res: Response) => Promise<void>;
  getNotificationList: (req: Request, res: Response) => Promise<void>;
  markNotificationAsRead: (req: Request, res: Response) => Promise<void>;
}

export const NotificationController = (
  baseController: IBaseController,
  notificationQueryUsecase: INotificationQueryUsecase,
  notificationCommandUsecase: INotificationCommandUsecase,
  prisma: PrismaClient,
): INotificationController => {
  const validate = baseController.validate;
  const sseManager = getSSEConnectionManager(prisma);

  /**
   * deviceId 생성
   */
  const generateDeviceId = (req: Request, userId: string): string => {
    const clientProvidedDeviceId = req.query.deviceId as string;
    if (clientProvidedDeviceId) {
      return clientProvidedDeviceId;
    }
    //from server
    const userAgent = req.headers["user-agent"] || "unknown";
    const timestamp = Date.now();
    const hash = crypto
      .createHash("md5")
      .update(userAgent)
      .digest("hex")
      .substring(0, 8);
    return `${userId}-${hash}-${timestamp}`;
  };

  //cleanup
  const setupClientCleanup = (
    userId: string,
    deviceId: string,
    connection: SSEClientConnection,
  ): void => {
    const cleanup = (): void => {
      try {
        sseManager.removeClient(userId, deviceId, connection);
      } catch (error) {
        // Silently handle cleanup errors
      }
    };
    connection.res.on("close", () => {
      cleanup();
    });

    connection.res.on("error", (error: Error) => {
      cleanup();
    });

    const timeoutId = setTimeout(
      () => {
        try {
          connection.res.end();
        } catch (error) {
          // Silently handle connection termination errors
        }
        cleanup();
      },
      30 * 60 * 1000,
    );

    connection.res.on("close", () => {
      clearTimeout(timeoutId);
    });
  };

  const getUnreadNotificationsSse = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const userRole = req.userRole || "USER";
    const apartmentId = req.apartmentId;

    const deviceId = generateDeviceId(req, userId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const connection: SSEClientConnection = {
      deviceId,
      res,
      role: userRole,
      connectedAt: new Date(),
      apartmentId,
    };

    try {
      sseManager.addClient(userId, connection);

      setupClientCleanup(userId, deviceId, connection);

      const pendingNotifications =
        await sseManager.getPendingNotifications(userId);

      const notificationArray = pendingNotifications.map((n) => n.data);

      const sseData = `event: alarm\ndata: ${JSON.stringify(notificationArray)}\n\n`;
      res.write(sseData);

      const heartbeatInterval = setInterval(() => {
        try {
          res.write(": ping\n\n");
        } catch (error) {
          clearInterval(heartbeatInterval);
          res.end();
        }
      }, 30000);

      res.on("close", () => {
        clearInterval(heartbeatInterval);
      });
    } catch (error) {
      res.status(500).json({ error: "SSE 연결 실패" });
    }
  };

  const getNotificationList = async (req: Request, res: Response) => {
    const reqDto = validate(createGetNotificationListReqSchema, {
      userId: req.userId,
      query: {
        page: req.query.page,
        limit: req.query.limit,
      },
    });
    const notificationListResponse =
      await notificationQueryUsecase.getNotificationList({
        userId: reqDto.userId,
        page: reqDto.query.page,
        limit: reqDto.query.limit,
      });
    res.status(200).json(notificationListResponse);
  };

  const markNotificationAsRead = async (req: Request, res: Response) => {
    const reqDto = validate(createMarkNotificationAsReadReqSchema, {
      userId: req.userId,
      params: {
        notificationReceiptId: req.params.notificationReceiptId,
      },
    });
    await notificationCommandUsecase.markAsRead({
      userId: reqDto.userId,
      notificationReceiptId: reqDto.params.notificationReceiptId,
    });

    res.status(204).json();
  };

  return {
    getUnreadNotificationsSse,
    getNotificationList,
    markNotificationAsRead,
  };
};

export type NotificationControllerService = ReturnType<
  typeof NotificationController
>;
