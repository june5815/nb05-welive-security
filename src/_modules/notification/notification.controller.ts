import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { INotificationQueryUsecase } from "./usecases/notification-query.usecase";
import { INotificationCommandUsecase } from "./usecases/notification-command.usecase";
import {
  getUnreadNotificationsSseReqSchema,
  createGetNotificationListReqSchema,
  createMarkNotificationAsReadReqSchema,
} from "./dtos/req/notificatio.request";

export interface INotificationController {
  getUnreadNotificationsSse: (req: Request, res: Response) => Promise<void>;
  getNotificationList: (req: Request, res: Response) => Promise<void>;
  markNotificationAsRead: (req: Request, res: Response) => Promise<void>;
}

export const NotificationController = (
  baseController: IBaseController,
  notificationQueryUsecase: INotificationQueryUsecase,
  notificationCommandUsecase: INotificationCommandUsecase,
): INotificationController => {
  const validate = baseController.validate;

  const getUnreadNotificationsSse = async (req: Request, res: Response) => {
    const reqDto = validate(getUnreadNotificationsSseReqSchema, {
      userId: req.userId,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const notifications = await notificationQueryUsecase.getUnreadNotifications(
      reqDto.userId,
    );

    const sseMessage = `data: ${JSON.stringify({
      type: "alarm",
      data: notifications,
    })}\n\n`;

    res.write(sseMessage);

    res.end();
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
