import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { getEventListReqSchema } from "./dtos/req/event.request";
import { IEventQueryService } from "./service/event-query.service";

export interface IEventController {
  getEventList: (req: Request, res: Response) => Promise<void>;
}

export const EventController = (
  baseController: IBaseController,
  eventQueryService: IEventQueryService,
): IEventController => {
  const validate = baseController.validate;

  return {
    getEventList: async (req, res) => {
      const reqDto = validate(getEventListReqSchema, {
        query: req.query,
      });

      const result = await eventQueryService.getEventList(reqDto);
      res.status(200).json(result);
    },
  };
};
