export interface HouseholdMemberView {
  id: string;
  createdAt: string;
  email: string;
  contact: string;
  name: string;
  building: number;
  unit: number;
  isHouseholder: boolean;
  userId: string;
}

export interface HouseholdMembersListView extends HouseholdMemberView {}

export interface HouseholdMemberDetailView extends HouseholdMemberView {}

export interface HouseholdMembersListResponseView {
  data: HouseholdMembersListView[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
