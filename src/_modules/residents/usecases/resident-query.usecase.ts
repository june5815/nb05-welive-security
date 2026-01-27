import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { IResidentQueryRepo } from "../domain/resident-query.repo.interface";
import { HouseholdMemberWithRelations } from "../domain/resident.type";
import {
  HouseholdMemberDetailView,
  HouseholdMembersListResponseView,
} from "../dtos/res/resident.view";

export interface IResidentQueryService {
  getListHouseholdMembers(
    apartmentId: string,
    page: number,
    limit: number,
    userId: string,
    role: string,
  ): Promise<HouseholdMembersListResponseView>;

  getHouseholdMemberDetail(
    householdMemberId: string,
    userId: string,
    role: string,
  ): Promise<HouseholdMemberDetailView>;
}

export const ResidentQueryService = (
  residentQueryRepo: IResidentQueryRepo,
): IResidentQueryService => {
  const getListHouseholdMembers = async (
    apartmentId: string,
    page: number,
    limit: number,
    userId: string,
    role: string,
  ): Promise<HouseholdMembersListResponseView> => {
    if (!apartmentId?.trim()) {
      throw new Error("apartmentId is required");
    }
    if (page < 1) {
      throw new Error("page must be >= 1");
    }
    if (limit < 1) {
      throw new Error("limit must be >= 1");
    }

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }
    if (role !== "ADMIN") {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    const validatedPage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { members, total } = await residentQueryRepo.findHouseholdMembers(
      apartmentId,
      validatedPage,
      safeLimit,
    );

    const totalPages = Math.ceil(total / safeLimit);
    const hasNext = validatedPage < totalPages;

    const data = members.map((member) => ({
      id: member.id,
      createdAt: member.createdAt.toISOString(),
      email: member.user.email,
      contact: member.user.contact,
      name: member.user.name,
      building: member.household.building,
      unit: member.household.unit,
      isHouseholder: member.isHouseholder,
      userId: member.user.id,
    }));

    return {
      data,
      total,
      page: validatedPage,
      limit: safeLimit,
      hasNext,
    };
  };

  const getHouseholdMemberDetail = async (
    householdMemberId: string,
    userId: string,
    role: string,
  ): Promise<HouseholdMemberDetailView> => {
    if (!householdMemberId?.trim()) {
      throw new Error("householdMemberId is required");
    }

    if (!userId || !role) {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }
    if (role !== "ADMIN") {
      throw new BusinessException({
        type: BusinessExceptionType.FORBIDDEN,
      });
    }

    const member =
      await residentQueryRepo.findHouseholdMemberById(householdMemberId);

    if (!member) {
      throw new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
      });
    }

    const detail: HouseholdMemberDetailView = {
      id: member.id,
      createdAt: member.createdAt.toISOString(),
      email: member.user.email,
      contact: member.user.contact,
      name: member.user.name,
      building: member.household.building,
      unit: member.household.unit,
      isHouseholder: member.isHouseholder,
      userId: member.user.id,
    };

    return detail;
  };

  return {
    getListHouseholdMembers,
    getHouseholdMemberDetail,
  };
};
