import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { IApartmentQueryUsecase } from "./usecases/query/apartment-query.usecase";
import {
  ApartmentListQuerySchema,
  ApartmentDetailParamSchema,
  SearchApartmentByNameSchema,
  SearchApartmentByAddressSchema,
  SearchApartmentByDescriptionSchema,
  SearchApartmentByOfficeNumberSchema,
  ValidateHouseholdSchema,
} from "./dtos/req/apartment.request";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";

export interface IApartmentController {
  getApartmentList: (req: Request, res: Response) => Promise<void>;
  getApartmentDetail: (req: Request, res: Response) => Promise<void>;
  searchApartmentByName: (req: Request, res: Response) => Promise<void>;
  searchApartmentByAddress: (req: Request, res: Response) => Promise<void>;
  searchApartmentByDescription: (req: Request, res: Response) => Promise<void>;
  searchApartmentByOfficeNumber: (req: Request, res: Response) => Promise<void>;
  getApartmentWithHouseholds: (req: Request, res: Response) => Promise<void>;
  validateHousehold: (req: Request, res: Response) => Promise<void>;
}

export const ApartmentController = (
  baseController: IBaseController,
  apartmentQueryUsecase: IApartmentQueryUsecase,
): IApartmentController => {
  const validate = baseController.validate;

  // 아파트 목록 조회 (페이지네이션)
  const getApartmentList = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const query = validate(ApartmentListQuerySchema, req.query);
    const apartmentList = await apartmentQueryUsecase.getApartmentList(query);
    res.status(200).json(apartmentList);
  };

  //아파트 세대 목록 조회
  const getApartmentDetail = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const params = validate(ApartmentDetailParamSchema, req.params);
    const result = await apartmentQueryUsecase.getApartmentWithHouseholds(
      params.id,
    );

    if (!result) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        message: "아파트를 찾을 수 없습니다.",
      });
    }

    res.status(200).json(result.households);
  };

  // serarch by apartmnet name
  const searchApartmentByName = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { name } = validate(SearchApartmentByNameSchema, req.query);

    const apartment = await apartmentQueryUsecase.searchApartmentByName(name);

    if (!apartment) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        message: "일치하는 아파트명이 없습니다.",
      });
    }

    res.status(200).json(apartment);
  };

  // by address
  const searchApartmentByAddress = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { address } = validate(SearchApartmentByAddressSchema, req.query);

    const apartment =
      await apartmentQueryUsecase.searchApartmentByAddress(address);

    if (!apartment) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        message: "일치하는 주소가 없습니다.",
      });
    }

    res.status(200).json(apartment);
  };

  // by description
  const searchApartmentByDescription = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { description } = validate(
      SearchApartmentByDescriptionSchema,
      req.query,
    );

    const apartments =
      await apartmentQueryUsecase.searchApartmentByDescription(description);

    res.status(200).json({
      data: apartments,
      count: apartments.length,
    });
  };

  // by contact
  const searchApartmentByOfficeNumber = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { officeNumber } = validate(
      SearchApartmentByOfficeNumberSchema,
      req.query,
    );

    const apartment =
      await apartmentQueryUsecase.searchApartmentByOfficeNumber(officeNumber);

    if (!apartment) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        message: "일치하는 관리소 전화번호가 없습니다.",
      });
    }

    res.status(200).json(apartment);
  };

  //apartment.household
  const getApartmentWithHouseholds = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const params = validate(ApartmentDetailParamSchema, req.params);

    const result = await apartmentQueryUsecase.getApartmentWithHouseholds(
      params.id,
    );

    if (!result) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        message: "아파트를 찾을 수 없습니다.",
      });
    }

    res.status(200).json(result);
  };

  // vali.houshhold
  const validateHousehold = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const params = validate(ApartmentDetailParamSchema, req.params);
    const { building, unit } = validate(ValidateHouseholdSchema, req.body);

    const validationResult = await apartmentQueryUsecase.validateHousehold(
      params.id,
      building,
      unit,
    );

    res.status(200).json(validationResult);
  };

  return {
    getApartmentList,
    getApartmentDetail,
    searchApartmentByName,
    searchApartmentByAddress,
    searchApartmentByDescription,
    searchApartmentByOfficeNumber,
    getApartmentWithHouseholds,
    validateHousehold,
  };
};
