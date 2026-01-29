import {
  BusinessException,
  BusinessExceptionType,
} from "../../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../../_common/exceptions/technical.exception";
import { IApartmentQueryRepo } from "../../../../_common/ports/repos/apartment/apartment-query-repo.interface";
import { ApartmentListQueryReq } from "../../dtos/req/apartment.request";
import {
  ApartmentDetailResView,
  ApartmentListResView,
} from "../../dtos/res/apartment.view";
import { ApartmentEntity, Apartment } from "../../domain/apartment.entity";
import { ApartmentMapper } from "../../../../_infra/mappers/apartment.mapper";

export interface IApartmentQueryUsecase {
  getApartmentList(query: ApartmentListQueryReq): Promise<ApartmentListResView>;
  getApartmentDetailById(
    apartmentId: string,
  ): Promise<ApartmentDetailResView | null>;
  searchApartmentByName(name: string): Promise<ApartmentDetailResView | null>;
  searchApartmentByAddress(
    address: string,
  ): Promise<ApartmentDetailResView | null>;
  searchApartmentByDescription(
    description: string,
  ): Promise<ApartmentDetailResView[]>;
  searchApartmentByOfficeNumber(
    officeNumber: string,
  ): Promise<ApartmentDetailResView | null>;
  getApartmentWithHouseholds(apartmentId: string): Promise<{
    apartment: ApartmentDetailResView;
    households: Array<{ building: number; unit: number }>;
  } | null>;
  validateHousehold(
    apartmentId: string,
    building: number,
    unit: number,
  ): Promise<{
    isValid: boolean;
    floorInfo?: { floor: number; sequence: number };
  }>;
}

export const ApartmentQueryUsecase = (
  apartmentQueryRepo: IApartmentQueryRepo,
): IApartmentQueryUsecase => {
  /**
   * 아파트 목록 조회 (페이징)
   */
  const getApartmentList = async (
    query: ApartmentListQueryReq,
  ): Promise<ApartmentListResView> => {
    try {
      return await apartmentQueryRepo.findApartmentList(query);
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 상세 조회 (ID)
   */
  const getApartmentDetailById = async (
    apartmentId: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const apartment =
        await apartmentQueryRepo.findApartmentDetailById(apartmentId);

      if (!apartment) {
        return null;
      }

      return apartment;
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 조회(이름)
   */
  const searchApartmentByName = async (
    name: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const apartment = await apartmentQueryRepo.findApartmentByName(name);
      return apartment || null;
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 조회(주소)
   */
  const searchApartmentByAddress = async (
    address: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const apartment =
        await apartmentQueryRepo.findApartmentByAddress(address);
      return apartment || null;
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 조회(설명)
   */
  const searchApartmentByDescription = async (
    description: string,
  ): Promise<ApartmentDetailResView[]> => {
    try {
      const apartments =
        await apartmentQueryRepo.findApartmentByDescription(description);
      return apartments;
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 전화번호
   */
  const searchApartmentByOfficeNumber = async (
    officeNumber: string,
  ): Promise<ApartmentDetailResView | null> => {
    try {
      const apartment =
        await apartmentQueryRepo.findApartmentByOfficeNumber(officeNumber);
      return apartment || null;
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 아파트 동호조합
   */
  const getApartmentWithHouseholds = async (
    apartmentId: string,
  ): Promise<{
    apartment: ApartmentDetailResView;
    households: Array<{ building: number; unit: number }>;
  } | null> => {
    try {
      const apartment =
        await apartmentQueryRepo.findApartmentDetailById(apartmentId);

      if (!apartment) {
        return null;
      }
      const apartmentEntity: Apartment = ApartmentMapper.toDomain(
        apartment as any,
      );
      const households =
        ApartmentEntity.getAllPossibleHouseholds(apartmentEntity);

      return { apartment, households };
    } catch (error) {
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  /**
   * 특정 세대(동/호)의 유효성 검증
   */
  const validateHousehold = async (
    apartmentId: string,
    building: number,
    unit: number,
  ): Promise<{
    isValid: boolean;
    floorInfo?: { floor: number; sequence: number };
  }> => {
    try {
      const apartment =
        await apartmentQueryRepo.findApartmentDetailById(apartmentId);

      if (!apartment) {
        throw new BusinessException({
          type: BusinessExceptionType.NOT_FOUND,
        });
      }

      const apartmentEntity: Apartment = ApartmentMapper.toDomain(
        apartment as any,
      );

      const isValid = ApartmentEntity.isValidHousehold(
        apartmentEntity,
        building,
        unit,
      );

      if (!isValid) {
        const isValidBuilding = ApartmentEntity.isValidBuilding(
          apartmentEntity,
          building,
        );
        const isValidUnit = ApartmentEntity.isValidUnit(apartmentEntity, unit);

        if (!isValidBuilding) {
          throw new BusinessException({
            type: BusinessExceptionType.VALIDATION_ERROR,
            message: `Building number ${building} is out of range. Valid range: ${apartment.buildingNumberFrom}-${apartment.buildingNumberTo}`,
          });
        }

        if (!isValidUnit) {
          const maxUnit =
            ApartmentEntity.getHouseholdCountPerBuilding(apartmentEntity);
          throw new BusinessException({
            type: BusinessExceptionType.VALIDATION_ERROR,
            message: `Unit ${unit} is out of range. Valid range: 1-${maxUnit}`,
          });
        }
      }

      const floorInfo = ApartmentEntity.getFloorAndSequenceFromUnit(
        apartmentEntity,
        unit,
      );

      return {
        isValid: true,
        floorInfo: floorInfo || undefined,
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error as Error,
      });
    }
  };

  return {
    getApartmentList,
    getApartmentDetailById,
    searchApartmentByName,
    searchApartmentByAddress,
    searchApartmentByDescription,
    searchApartmentByOfficeNumber,
    getApartmentWithHouseholds,
    validateHousehold,
  };
};
