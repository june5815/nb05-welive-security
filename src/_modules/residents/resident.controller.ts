import { Request, Response, NextFunction } from "express";
import { IResidentQueryService } from "./usecases/resident-query.usecase";
import {
  IResidentCommandService,
  ResidentCommandService,
} from "./usecases/resident-command.usecase";
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
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";

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
        query: req.query,
      });

      const adminApartmentId =
        validatedReq.role === "ADMIN" ? (req as any).user?.apartmentId : null;
      const result: HouseholdMembersListResponseView =
        await residentQueryService.getListHouseholdMembers(
          adminApartmentId,
          validatedReq.query.page,
          validatedReq.query.limit,
          validatedReq.query.building,
          validatedReq.query.unit,
          validatedReq.query.searchKeyword,
          validatedReq.query.isHouseholder,
          validatedReq.query.isRegistered,
          validatedReq.userId,
          validatedReq.role,
        );

      res.status(200).json({
        data: result.data,
        totalCount: result.total,
        page: result.page,
        limit: result.limit,
        hasNext: result.hasNext,
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

const downloadResidentTemplate =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const csvHeader = "email,contact,name,building,unit,isHouseholder";
      const csvExamples = [
        "test1@example.com,01012345678,장원영,1,101,true",
        "test2@example.com,01023456789,고윤정,1,102,false",
      ].join("\n");
      const csvContent = `${csvHeader}\n${csvExamples}\n`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="residents_template.csv"',
      );
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };

const importResidentsFromFile =
  (residentCommandService: IResidentCommandService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          statusCode: 400,
          message: "파일이 필요합니다.",
        });
        return;
      }

      // JWT에서 apartmentId 가져오기 (ADMIN만 가능)
      const apartmentId = (req as any).user?.apartmentId;
      if (!apartmentId) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("아파트 정보를 찾을 수 없습니다."),
        });
      }

      const result =
        await residentCommandService.registerManyHouseholdMembersFromCsv(
          req.file.buffer,
          (req as any).user?.id,
          apartmentId,
          (req as any).user?.role,
        );

      res.status(200).json({
        statusCode: 200,
        message: "입주민 파일 업로드 성공",
        data: {
          count: result,
        },
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
        email: req.body.email,
        contact: req.body.contact,
        name: req.body.name,
        building: req.body.building,
        unit: req.body.unit,
        isHouseholder: req.body.isHouseholder,
      });

      if (validatedReq.role !== "ADMIN") {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 정보 수정은 관리자(ADMIN)만 가능합니다."),
        });
      }

      const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await residentCommandService.updateHouseholdMemberByAdmin(
        memberId,
        {
          email: validatedReq.email,
          contact: validatedReq.contact,
          name: validatedReq.name,
          building: validatedReq.building,
          unit: validatedReq.unit,
          isHouseholder: validatedReq.isHouseholder,
        },
        (req as any).user?.id,
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

const deleteResidentHouseholdMember =
  (residentCommandService: IResidentCommandService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!memberId?.trim()) {
        res.status(400).json({
          statusCode: 400,
          message: "입주민 ID는 필수입니다.",
        });
        return;
      }

      await residentCommandService.deleteHouseholdMemberByAdmin(
        memberId,
        (req as any).user?.id,
        (req as any).user?.role,
      );

      res.status(200).json({
        statusCode: 200,
        message: "입주민 정보 삭제 성공",
      });
    } catch (error) {
      next(error);
    }
  };

// 입주민 명부 다운로드 (CSV)
const exportResidentList =
  (residentQueryService: IResidentQueryService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedReq = householdMembersListReqSchema.parse({
        userId: (req as any).user?.id,
        role: (req as any).user?.role,
        query: req.query,
      });

      const adminApartmentId =
        validatedReq.role === "ADMIN" ? (req as any).user?.apartmentId : null;
      const result = await residentQueryService.getListHouseholdMembers(
        adminApartmentId,
        validatedReq.query.page,
        validatedReq.query.limit,
        validatedReq.query.building,
        validatedReq.query.unit,
        validatedReq.query.searchKeyword,
        validatedReq.query.isHouseholder,
        validatedReq.query.isRegistered,
        validatedReq.userId,
        validatedReq.role,
      );

      // CSV 생성
      const csvHeader = "이메일,연락처,이름,건물,호수,세대주,가입상태,등록일자";
      const csvRows = result.data.map(
        (member: any) =>
          `"${member.email}","${member.contact}","${member.name}",${member.building},${member.unit},"${member.isHouseholder ? "예" : "아니오"}","${member.userId ? "가입함" : "미가입"}",${member.createdAt}`,
      );
      const csvContent = [csvHeader, ...csvRows].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="residents.csv"',
      );
      res.send(csvContent);
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
  downloadResidentTemplate: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  importResidentsFromFile: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  exportResidentList: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  updateResidentHouseholdMember: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  deleteResidentHouseholdMember: (
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
    downloadResidentTemplate: downloadResidentTemplate(),
    importResidentsFromFile: importResidentsFromFile(residentCommandService),
    exportResidentList: exportResidentList(residentQueryService),
    getHouseholdMemberDetail: getHouseholdMemberDetail(residentQueryService),
    updateResidentHouseholdMember: updateResidentHouseholdMember(
      residentCommandService,
    ),
    deleteResidentHouseholdMember: deleteResidentHouseholdMember(
      residentCommandService,
    ),
  };
};
