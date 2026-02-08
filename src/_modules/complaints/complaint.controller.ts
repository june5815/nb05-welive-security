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

  /** 민원 생성 */
  const create = async (req: Request, res: Response) => {
    const dto = validate(createComplaintReqSchema, {
      body: req.body,
      userId: req.user!.id,
      role: req.user!.role,
    });

    await complaintCommandService.create(dto);
    res.status(201).json();
  };

  /** 민원 목록 */
  const list = async (req: Request, res: Response) => {
    const dto = validate(getComplaintListReqSchema, {
      query: req.query,
      userId: req.user!.id,
      role: req.user!.role,
    });

    const result = await complaintQueryService.getList(dto);
    res.status(200).json(result);
  };

  /** 민원 상세 */
  const detail = async (req: Request, res: Response) => {
    const dto = validate(complaintIdParamSchema, {
      params: req.params,
      userId: req.user!.id,
      role: req.user!.role,
    });

    const result = await complaintQueryService.getDetail(dto);
    res.status(200).json(result);
  };

  return { create, list, detail };
};
