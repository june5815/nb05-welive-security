import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import { IResidentQueryRepo } from "../../../_common/ports/repos/resident/resident-query.repo.interface";
import {
  HouseholdMemberDetailView,
  HouseholdMembersListResponseView,
} from "../dtos/res/resident.view";

export interface IResidentQueryService {
  getListHouseholdMembers(
    apartmentId?: string,
    page?: number,
    limit?: number,
    building?: number,
    unit?: number,
    searchKeyword?: string,
    isHouseholder?: boolean,
    isRegistered?: boolean,
    userId?: string,
    role?: string,
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
    apartmentId?: string,
    page?: number,
    limit?: number,
    building?: number,
    unit?: number,
    searchKeyword?: string,
    isHouseholder?: boolean,
    isRegistered?: boolean,
    userId?: string,
    role?: string,
  ): Promise<HouseholdMembersListResponseView> => {
    // 권한 검증
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

    if (!page || page < 1) {
      throw new Error("page must be >= 1");
    }
    if (!limit || limit < 1) {
      throw new Error("limit must be >= 1");
    }

    const validatedPage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const filters = {
      building,
      unit,
      searchKeyword,
      isHouseholder,
      isRegistered,
    };

    const { members, total } = await residentQueryRepo.findHouseholdMembers(
      apartmentId,
      validatedPage,
      safeLimit,
      filters,
    );

    const totalPages = Math.ceil(total / safeLimit);
    const hasNext = validatedPage < totalPages;

    const data = members.map((member) => ({
      id: member.id,
      createdAt: member.createdAt.toISOString(),
      email: member.user?.email ?? member.email,
      contact: member.user?.contact ?? member.contact,
      name: member.user?.name ?? member.name,
      building: member.household.building,
      unit: member.household.unit,
      isHouseholder: member.isHouseholder,
      userId: member.userId,
      apartment: {
        id: member.household.apartment.id,
        name: member.household.apartment.name,
        address: member.household.apartment.address,
      },
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
      email: member.user?.email ?? member.email,
      contact: member.user?.contact ?? member.contact,
      name: member.user?.name ?? member.name,
      building: member.household.building,
      unit: member.household.unit,
      isHouseholder: member.isHouseholder,
      userId: member.userId,
      apartment: {
        id: member.household.apartment.id,
        name: member.household.apartment.name,
        address: member.household.apartment.address,
      },
    };

    return detail;
  };

  return {
    getListHouseholdMembers,
    getHouseholdMemberDetail,
  };
};
