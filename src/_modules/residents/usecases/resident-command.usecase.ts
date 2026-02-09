import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { IResidentCommandRepo } from "../../../_common/ports/repos/resident/resident-command.repo.interface";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import { HouseholdEntity } from "../domain/resident.entity";
import { HouseholdMember, UserType } from "../domain/resident.type";
import { UserRole } from "../../../_modules/users/domain/user.entity";

export interface CreateResidentDTO {
  building: number;
  unit: number;
  email: string;
  contact: string;
  name: string;
  isHouseholder: boolean;
}

export interface UpdateResidentDTO {
  email?: string;
  contact?: string;
  name?: string;
  building?: number;
  unit?: number;
  isHouseholder?: boolean;
}

export interface IResidentCommandService {
  registerHouseholdMemberByAdmin(
    dto: CreateResidentDTO,
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<HouseholdMember>;
  registerManyHouseholdMembers(
    dtos: CreateResidentDTO[],
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<HouseholdMember[]>;
  registerManyHouseholdMembersFromCsv(
    fileBuffer: Buffer,
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<number>;
  updateHouseholdMemberByAdmin(
    memberId: string,
    dto: UpdateResidentDTO,
    adminId: string,
    role: string,
  ): Promise<HouseholdMember>;
  deleteHouseholdMemberByAdmin(
    memberId: string,
    adminId: string,
    role: string,
  ): Promise<void>;
}

export const ResidentCommandService = (
  commandRepo: IResidentCommandRepo,
  queryRepo: IResidentQueryRepo,
): IResidentCommandService => {
  const registerHouseholdMemberByAdmin = async (
    dto: CreateResidentDTO,
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<HouseholdMember> => {
    try {
      if (role !== UserRole.ADMIN) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 등록은 관리자(ADMIN)만 가능합니다."),
        });
      }

      if (!dto.building || !dto.unit) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("건물번호와 호수는 필수입니다."),
        });
      }

      if (!dto.email?.trim()) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("이메일은 필수입니다."),
        });
      }

      if (!dto.contact?.trim()) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("연락처는 필수입니다."),
        });
      }

      if (!dto.name?.trim()) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("이름은 필수입니다."),
        });
      }

      const household = await queryRepo.findHouseholdByBuildingAndUnit(
        apartmentId,
        dto.building,
        dto.unit,
      );

      if (!household) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("존재하지 않는 세대입니다."),
        });
      }

      const existingMember = await queryRepo.findHouseholdMemberByEmail(
        dto.email,
      );
      if (existingMember) {
        throw new BusinessException({
          type: BusinessExceptionType.DUPLICATE_EMAIL,
          error: new Error("이미 등록된 이메일입니다."),
        });
      }

      const householdMember = HouseholdEntity.createHouseholdMemberByAdmin({
        householdId: household.id,
        email: dto.email,
        contact: dto.contact,
        name: dto.name,
        isHouseholder: dto.isHouseholder,
      });

      const savedMember =
        await commandRepo.createHouseholdMember(householdMember);
      return savedMember;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      if (error instanceof TechnicalException) {
        throw error;
      }

      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const registerManyHouseholdMembers = async (
    dtos: CreateResidentDTO[],
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<HouseholdMember[]> => {
    try {
      if (role !== UserRole.ADMIN) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 등록은 관리자(ADMIN)만 가능합니다."),
        });
      }

      if (!Array.isArray(dtos) || dtos.length === 0) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("최소 1개 이상의 입주민 정보가 필요합니다."),
        });
      }

      const results: HouseholdMember[] = [];

      for (const dto of dtos) {
        try {
          const member = await registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            role,
          );
          results.push(member);
        } catch (error) {
          // 실패한 입주민
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            ` 입주민 등록 실패 - 이메일: ${dto.email}, 이름: ${dto.name}, 사유: ${errorMessage}`,
          );
        }
      }

      return results;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }

      if (error instanceof TechnicalException) {
        throw error;
      }

      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const updateHouseholdMemberByAdmin = async (
    memberId: string,
    dto: UpdateResidentDTO,
    adminId: string,
    role: string,
  ): Promise<HouseholdMember> => {
    try {
      if (role !== UserRole.ADMIN) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 수정은 관리자(ADMIN)만 가능합니다."),
        });
      }

      if (!memberId?.trim()) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 ID는 필수입니다."),
        });
      }

      // 기존 입주민 조회
      const existingMember = await queryRepo.findHouseholdMemberById(memberId);
      if (!existingMember) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("존재하지 않는 입주민입니다."),
        });
      }

      if (dto.email && dto.email !== existingMember.email) {
        const duplicateEmail = await queryRepo.findHouseholdMemberByEmail(
          dto.email,
        );
        if (duplicateEmail) {
          throw new BusinessException({
            type: BusinessExceptionType.DUPLICATE_EMAIL,
            error: new Error("이미 등록된 이메일입니다."),
          });
        }
      }

      let newHouseholdId = existingMember.householdId;
      if (dto.building !== undefined || dto.unit !== undefined) {
        const newBuilding = dto.building ?? existingMember.household.building;
        const newUnit = dto.unit ?? existingMember.household.unit;

        const newHousehold = await queryRepo.findHouseholdByBuildingAndUnit(
          existingMember.household.apartmentId,
          newBuilding,
          newUnit,
        );

        if (!newHousehold) {
          throw new BusinessException({
            type: BusinessExceptionType.FORBIDDEN,
            error: new Error("존재하지 않는 세대입니다."),
          });
        }

        newHouseholdId = newHousehold.id;
      }

      const updatedMember = HouseholdEntity.updateHouseholdMemberInfo(
        existingMember as any,
        {
          email: dto.email ?? existingMember.email,
          contact: dto.contact ?? existingMember.contact,
          name: dto.name ?? existingMember.name,
          isHouseholder: dto.isHouseholder ?? existingMember.isHouseholder,
        },
      );

      let finalMember = updatedMember;
      if (newHouseholdId !== existingMember.householdId) {
        finalMember = { ...updatedMember, householdId: newHouseholdId };
      }

      const savedMember = await commandRepo.updateHouseholdMember(finalMember);
      return savedMember;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      if (error instanceof TechnicalException) {
        throw error;
      }

      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const deleteHouseholdMemberByAdmin = async (
    memberId: string,
    adminId: string,
    role: string,
  ): Promise<void> => {
    try {
      if (role !== UserRole.ADMIN) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 삭제는 관리자(ADMIN)만 가능합니다."),
        });
      }

      if (!memberId?.trim()) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 ID는 필수입니다."),
        });
      }

      const existingMember = await queryRepo.findHouseholdMemberById(memberId);
      if (!existingMember) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("존재하지 않는 입주민입니다."),
        });
      }

      await commandRepo.deleteHouseholdMember(memberId);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      if (error instanceof TechnicalException) {
        throw error;
      }

      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const registerManyHouseholdMembersFromCsv = async (
    fileBuffer: Buffer,
    adminId: string,
    apartmentId: string,
    role: string,
  ): Promise<number> => {
    try {
      if (role !== UserRole.ADMIN) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("입주민 등록은 관리자(ADMIN)만 가능합니다."),
        });
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("유효한 파일이 필요합니다."),
        });
      }

      const { parse } = await import("csv-parse/sync");
      const csvContent = fileBuffer.toString("utf-8");
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (!Array.isArray(records) || records.length === 0) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("CSV 파일이 비어있습니다."),
        });
      }

      const dtos: CreateResidentDTO[] = records.map((row: any) => ({
        email: row.email?.trim(),
        contact: row.contact?.trim(),
        name: row.name?.trim(),
        building: parseInt(row.building, 10),
        unit: parseInt(row.unit, 10),
        isHouseholder:
          row.isHouseholder?.trim?.().toLowerCase() === "true" || false,
      }));

      const validDtos: CreateResidentDTO[] = [];
      for (const dto of dtos) {
        if (
          dto.email &&
          dto.contact &&
          dto.name &&
          !isNaN(dto.building) &&
          !isNaN(dto.unit)
        ) {
          validDtos.push(dto);
        }
      }

      if (validDtos.length === 0) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("유효한 데이터가 없습니다."),
        });
      }

      const results = await registerManyHouseholdMembers(
        validDtos,
        adminId,
        apartmentId,
        role,
      );

      const successCount = results.length;
      const failureCount = validDtos.length - successCount;

      console.log(`\n📊 CSV 입주민 등록 결과`);
      console.log(`   ✓ 성공: ${successCount}명`);
      console.log(`   ❌ 실패: ${failureCount}명\n`);

      return results.length;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      if (error instanceof TechnicalException) {
        throw error;
      }

      throw new TechnicalException({
        type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  return {
    registerHouseholdMemberByAdmin,
    registerManyHouseholdMembers,
    registerManyHouseholdMembersFromCsv,
    updateHouseholdMemberByAdmin,
    deleteHouseholdMemberByAdmin,
  };
};
