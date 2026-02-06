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
  ): Promise<{
    results: HouseholdMember[];
    failedRecords: Array<{ dto: CreateResidentDTO; error: string }>;
  }>;
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
    apartmentId: string,
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

      if (dto.isHouseholder) {
        console.log("[REGISTER]  세대주가 이미 존재하는 세대입니다: ", {
          building: dto.building,
          unit: dto.unit,
          householdMembers: household.members?.length || 0,
        });

        const existingHouseholder = household.members?.find(
          (member) => member.isHouseholder && !member.movedOutAt,
        );
        if (existingHouseholder) {
          console.log(
            "[REGI.Rejected] 기존 세대주의 거주형태를 먼저 변경해주세요.:",
            {
              existingHouseholderId: existingHouseholder.id,
              existingHouseholderName: existingHouseholder.name,
            },
          );
          throw new BusinessException({
            type: BusinessExceptionType.FORBIDDEN,
            error: new Error(
              `세대주 변경이 거절되었습니다. 등록을 위해 기존 세대주의 거주형태를 먼저 변경해주세요. (기존 세대주: ${existingHouseholder.name})`,
            ),
          });
        }
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
  ): Promise<{
    results: HouseholdMember[];
    failedRecords: Array<{ dto: CreateResidentDTO; error: string }>;
  }> => {
    try {
      if (role !== UserRole.ADMIN) {
        console.log("[REGISTER MANY] 권한 없음");
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
      const failedRecords: Array<{
        dto: CreateResidentDTO;
        error: string;
      }> = [];

      for (let index = 0; index < dtos.length; index++) {
        const dto = dtos[index];

        try {
          const member = await registerHouseholdMemberByAdmin(
            dto,
            adminId,
            apartmentId,
            role,
          );

          results.push(member);
        } catch (error) {
          let errorMessage = "알 수 없는 오류가 발생했습니다.";

          if (error instanceof BusinessException) {
            errorMessage =
              error.error?.message ||
              error.message ||
              "권한과 관련된 오류입니다.";
          } else if (error instanceof TechnicalException) {
            errorMessage =
              error.error?.message ||
              error.message ||
              "알 수 없는 서버 에러가 발생했습니다.";
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          failedRecords.push({
            dto,
            error: errorMessage,
          });
        }
      }

      return { results, failedRecords };
    } catch (error) {
      console.error("[REGISTER MANY] 에러:", error);
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
    apartmentId: string,
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

      if (!apartmentId) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("아파트 정보가 필요합니다."),
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

      if (existingMember.household.apartmentId !== apartmentId) {
        console.log("[UPDATE RESIDENT] 권한 없음:", {
          memberApartmentId: existingMember.household.apartmentId,
          adminApartmentId: apartmentId,
        });
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("해당 아파트의 입주민만 수정 가능합니다."),
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

        if (dto.isHouseholder && !existingMember.isHouseholder) {
          const existingHouseholder = newHousehold.members?.find(
            (member) => member.isHouseholder && !member.movedOutAt,
          );
          if (existingHouseholder) {
            console.log(
              "[UPDATE] 해당 세대에 이미 세대주가 존재합니다. 세대주 정보:",
              {
                householderId: existingHouseholder.id,
                householderName: existingHouseholder.name,
              },
            );
            throw new BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
              error: new Error(
                `해당 세대의 세대주는 이미 존재합니다. (기존 세대주: ${existingHouseholder.name})`,
              ),
            });
          }
        }

        newHouseholdId = newHousehold.id;
      }

      // 기존 입주민 정보 업데이트
      const updatedMember = HouseholdEntity.updateHouseholdMemberInfo(
        existingMember as any,
        {
          email: dto.email ?? existingMember.email,
          contact: dto.contact ?? existingMember.contact,
          name: dto.name ?? existingMember.name,
          isHouseholder: dto.isHouseholder ?? existingMember.isHouseholder,
        },
      );

      if (
        dto.isHouseholder &&
        !existingMember.isHouseholder &&
        newHouseholdId === existingMember.householdId
      ) {
        const householdMembers = await queryRepo.findHouseholdMembers(
          undefined,
          1,
          100,
          {
            building: existingMember.household.building,
            unit: existingMember.household.unit,
          },
        );

        const currentHouseholder = householdMembers.members.find(
          (member) =>
            member.id !== existingMember.id &&
            member.isHouseholder &&
            !member.movedOutAt,
        );
        if (currentHouseholder) {
          console.log("[UPDATE] 기존 세대주가 존재합니다:", {
            householderId: currentHouseholder.id,
            householderName: currentHouseholder.name,
          });
          throw new BusinessException({
            type: BusinessExceptionType.FORBIDDEN,
            error: new Error(
              `이 세대의 세대주는 이미 존재합니다. (기존 세대주: ${currentHouseholder.name})\n기존 세대주를 먼저 세대주 해제한 후 변경해주세요.`,
            ),
          });
        }
      }

      let finalMember = updatedMember;
      if (newHouseholdId !== existingMember.householdId) {
        finalMember = { ...updatedMember, householdId: newHouseholdId };
      }

      const savedMember = await commandRepo.updateHouseholdMember(
        finalMember,
        existingMember,
      );

      return savedMember;
    } catch (error) {
      if (error instanceof BusinessException) {
        console.error("[UPDATE RESIDENT] BusinessException :", {
          errorMessage: error.error?.message,
        });
        throw error;
      }
      if (error instanceof TechnicalException) {
        console.error("[UPDATE RESIDENT] TechnicalException :", {
          type: error.type,
          errorMessage: error.error?.message,
        });
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

      // 기존 입주민 조회
      const existingMember = await queryRepo.findHouseholdMemberById(memberId);
      if (!existingMember) {
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("존재하지 않는 입주민입니다."),
        });
      }

      // movedOutAt
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
      // if (role !== UserRole.ADMIN) {
      //   console.log("[BATCH REGISTER] 권한 없음 - ADMIN이 아님");
      //   throw new BusinessException({
      //     type: BusinessExceptionType.FORBIDDEN,
      //     error: new Error("입주민 등록은 관리자(ADMIN)만 가능합니다."),
      //   });
      // }

      if (!fileBuffer || fileBuffer.length === 0) {
        console.log(
          "[BATCH REGISTER] 해당 파일 형식 불가! csv 파일만 업로드해주세요.",
        );
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
        console.log("[BATCH REGISTER] CSV 파일이 비어있음");
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("CSV 파일이 비어있습니다."),
        });
      }

      const dtos: CreateResidentDTO[] = records.map((row: any) => {
        const dto = {
          email: row.email?.trim(),
          contact: row.contact?.trim(),
          name: row.name?.trim(),
          building: parseInt(row.building, 10),
          unit: parseInt(row.unit, 10),
          isHouseholder: row.isHouseholder?.toLowerCase() === "true",
        };

        return dto;
      });

      const validDtos: CreateResidentDTO[] = [];
      for (const dto of dtos) {
        if (dto.email && dto.contact && dto.name && dto.building && dto.unit) {
          validDtos.push(dto);
        } else {
        }
      }

      if (validDtos.length === 0) {
        console.log("[BATCH REGISTER] 유효한 데이터가 없음");
        throw new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
          error: new Error("유효한 데이터가 없습니다."),
        });
      }

      const { results, failedRecords } = await registerManyHouseholdMembers(
        validDtos,
        adminId,
        apartmentId,
        role,
      );

      const failuresByReason: { [key: string]: string[] } = {};
      failedRecords.forEach((record) => {
        const reason = record.error;
        if (!failuresByReason[reason]) {
          failuresByReason[reason] = [];
        }
        failuresByReason[reason].push(record.dto.name);
      });

      Object.entries(failuresByReason).forEach(([reason, names]) => {
        console.log(`[BATCH REGISTER] ${reason} - ${names.join(", ")}`);
      });

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
