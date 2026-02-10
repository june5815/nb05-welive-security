import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";

import { createComplaintReqSchema } from "./dtos/req/create-complaint.request";
import { getComplaintListReqSchema } from "./dtos/req/get-complaint-list.request";
import { complaintIdParamSchema } from "./dtos/req/complaint-id-param.request";
import { updateComplaintStatusReqSchema } from "./dtos/req/update-complaint-status.request";

import { ComplaintCommandService } from "./service/complaint-command.service";
import { ComplaintQueryService } from "./service/complaint-query.service";

export interface IComplaintController {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
  detail: (req: Request, res: Response) => Promise<void>;
  updateStatus: (req: Request, res: Response) => Promise<void>;
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
      userId: req.user!.id,
      role: req.user!.role,
      apartmentId: req.user!.apartmentId,
    });

    const createdComplaint = await complaintCommandService.create({
      ...dto,
      body: {
        ...dto.body,
        apartmentId: dto.apartmentId,
      },
    });

    res.status(201).json({
      id: createdComplaint.id,
      title: createdComplaint.title,
      content: createdComplaint.content,
      isPublic: createdComplaint.isPublic,
      status: createdComplaint.status,
      createdAt: createdComplaint.createdAt,
    });
  };

  const list = async (req: Request, res: Response) => {
    const dto = validate(getComplaintListReqSchema, {
      query: {
        ...req.query,
        apartmentId: req.user!.apartmentId,
      },
      userId: req.user!.id,
      role: req.user!.role,
    });

    const result = await complaintQueryService.getList(dto);
    res.status(200).json(result);
  };

  const detail = async (req: Request, res: Response) => {
    const dto = validate(complaintIdParamSchema, {
      params: req.params,
      userId: req.user!.id,
      role: req.user!.role,
      apartmentId: req.user!.apartmentId,
    });

    const result = await complaintQueryService.getDetail(dto);
    res.status(200).json(result);
  };

  const updateStatus = async (req: Request, res: Response) => {
    const dto = validate(updateComplaintStatusReqSchema, {
      params: req.params,
      body: req.body,
      userId: req.user!.id,
      role: req.user!.role,
      apartmentId: req.user!.apartmentId,
    });

    await complaintCommandService.updateStatus({
      ...dto,
      params: {
        ...dto.params,
      },
      body: {
        ...dto.body,
      },
    });

    res.status(204).send();
  };

  return { create, list, detail, updateStatus };
};
