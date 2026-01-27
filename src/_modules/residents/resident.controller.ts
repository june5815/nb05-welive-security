import { Request, Response, NextFunction } from "express";
import { IResidentQueryService } from "./usecases/resident-query.usecase";
import {
  householdMembersListReqSchema,
  householdMemberDetailReqSchema,
} from "./dtos/req/resident.request";
import {
  HouseholdMembersListResponseView,
  HouseholdMemberDetailView,
} from "./dtos/res/resident.view";

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

export interface IResidentController {
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
}
export const createResidentController = (
  residentQueryService: IResidentQueryService,
): IResidentController => {
  return {
    getListHouseholdMembers: getListHouseholdMembers(residentQueryService),
    getHouseholdMemberDetail: getHouseholdMemberDetail(residentQueryService),
  };
};
