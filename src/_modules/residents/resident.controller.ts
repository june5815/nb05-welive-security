import { Request, Response, NextFunction } from "express";
import { IResidentQueryService } from "./usecases/resident-query.usecase";
import { IResidentCommandService } from "./usecases/resident-command.usecase";
import {
  householdMembersListReqSchema,
  householdMemberDetailReqSchema,
  createResidentReqSchema,
  updateResidentReqSchema,
} from "./dtos/req/resident.request";
import {
  HouseholdMembersListResponseView,
  HouseholdMemberDetailView,
} from "./dtos/res/resident.view";

const createResidentHouseholdMember =
  (residentCommandService: IResidentCommandService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedReq = createResidentReqSchema.parse({
        role: (req as any).user?.role,
        body: {
          apartmentId: req.body.apartmentId,
          email: req.body.email,
          contact: req.body.contact,
          name: req.body.name,
          building: req.body.building,
          unit: req.body.unit,
          isHouseholder: req.body.isHouseholder ?? false,
        },
      });

      const result =
        await residentCommandService.registerHouseholdMemberByAdmin(
          {
            email: validatedReq.body.email,
            contact: validatedReq.body.contact,
            name: validatedReq.body.name,
            building: validatedReq.body.building,
            unit: validatedReq.body.unit,
            isHouseholder: validatedReq.body.isHouseholder,
          },
          (req as any).user?.id,
          validatedReq.body.apartmentId,
          validatedReq.role,
        );

      res.status(201).json({
        statusCode: 201,
        message: "입주민 등록 성공",
        data: {
          id: result.id,
          createdAt: result.createdAt.toISOString(),
          email: result.email,
          contact: result.contact,
          name: result.name,
          isHouseholder: result.isHouseholder,
          userId: result.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  };
const getListHouseholdMembers =
  (residentQueryService: IResidentQueryService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedReq = householdMembersListReqSchema.parse({
        userId: (req as any).user?.id,
        role: (req as any).user?.role,
        params: req.params,
        query: req.query,
      });

      const result: HouseholdMembersListResponseView =
        await residentQueryService.getListHouseholdMembers(
          validatedReq.params.apartmentId,
          validatedReq.query.page,
          validatedReq.query.limit,
          validatedReq.userId,
          validatedReq.role,
        );

      res.status(200).json({
        statusCode: 200,
        message: "입주민 목록 조회 성공",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getHouseholdMemberDetail =
  (residentQueryService: IResidentQueryService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedReq = householdMemberDetailReqSchema.parse({
        userId: (req as any).user?.id,
        role: (req as any).user?.role,
        params: {
          apartmentId: req.params.apartmentId,
          householdMemberId: req.params.householdMemberId,
        },
      });

      const result: HouseholdMemberDetailView =
        await residentQueryService.getHouseholdMemberDetail(
          validatedReq.params.householdMemberId,
          validatedReq.userId,
          validatedReq.role,
        );

      res.status(200).json({
        statusCode: 200,
        message: "입주민 상세 조회 성공",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const updateResidentHouseholdMember =
  (residentCommandService: IResidentCommandService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedReq = updateResidentReqSchema.parse({
        role: (req as any).user?.role,
        params: {
          id: req.params.id,
        },
        body: {
          email: req.body.email,
          contact: req.body.contact,
          name: req.body.name,
          building: req.body.building,
          unit: req.body.unit,
          isHouseholder: req.body.isHouseholder,
        },
      });

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        validatedReq.params.id,
        {
          email: validatedReq.body.email,
          contact: validatedReq.body.contact,
          name: validatedReq.body.name,
          building: validatedReq.body.building,
          unit: validatedReq.body.unit,
          isHouseholder: validatedReq.body.isHouseholder,
        },
        (req as any).user?.id,
        req.body.apartmentId,
        validatedReq.role,
      );

      res.status(200).json({
        statusCode: 200,
        message: "입주민 정보 수정 성공",
        data: {
          id: result.id,
          updatedAt: result.updatedAt.toISOString(),
          email: result.email,
          contact: result.contact,
          name: result.name,
          isHouseholder: result.isHouseholder,
          userId: result.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export interface IResidentController {
  createResidentHouseholdMember: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  getListHouseholdMembers: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  getHouseholdMemberDetail: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  updateResidentHouseholdMember: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}

export const createResidentController = (
  residentCommandService: IResidentCommandService,
  residentQueryService: IResidentQueryService,
): IResidentController => {
  return {
    createResidentHouseholdMember: createResidentHouseholdMember(
      residentCommandService,
    ),
    getListHouseholdMembers: getListHouseholdMembers(residentQueryService),
    getHouseholdMemberDetail: getHouseholdMemberDetail(residentQueryService),
    updateResidentHouseholdMember: updateResidentHouseholdMember(
      residentCommandService,
    ),
  };
};
