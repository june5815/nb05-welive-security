import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";

import { createComplaintReqSchema } from "./dtos/req/create-complaint.request";
import { getComplaintListReqSchema } from "./dtos/req/get-complaint-list.request";
import { complaintIdParamSchema } from "./dtos/req/complaint-id-param.request";

import { ComplaintCommandService } from "./service/complaint-command.service";
import { ComplaintQueryService } from "./service/complaint-query.service";

export interface IComplaintController {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
  detail: (req: Request, res: Response) => Promise<void>;
}

export const ComplaintController = (
  baseController: IBaseController,
  complaintCommandService: ReturnType<typeof ComplaintCommandService>,
  complaintQueryService: ReturnType<typeof ComplaintQueryService>,
): IComplaintController => {
  const validate = baseController.validate;

  const create = async (req: Request, res: Response) => {
    const dto = validate(createComplaintReqSchema, {
      body: req.body,
      userId: req.userId,
      role: req.userRole,
    });

    await complaintCommandService.create(dto);

    res.status(201).json();
  };

  const list = async (req: Request, res: Response) => {
    const dto = validate(getComplaintListReqSchema, {
      query: req.query,
      userId: req.userId,
      role: req.userRole,
    });

    const result = await complaintQueryService.getList(dto);

    res.status(200).json(result);
  };

  const detail = async (req: Request, res: Response) => {
    const dto = validate(complaintIdParamSchema, {
      params: req.params,
      userId: req.userId,
      role: req.userRole,
    });

    const result = await complaintQueryService.getDetail(dto);

    res.status(200).json(result);
  };

  return {
    create,
    list,
    detail,
  };
};
