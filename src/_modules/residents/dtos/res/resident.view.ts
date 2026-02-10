export interface HouseholdMemberView {
  id: string;
  createdAt: string;
  email: string;
  contact: string;
  name: string;
  building: number;
  unit: number;
  isHouseholder: boolean;
  userId: string | undefined;
  apartment: {
    id: string;
    name: string;
    address: string;
  };
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

export interface CreateResidentResView extends HouseholdMemberView {
  id: string;
  email: string;
  contact: string;
  name: string;
  building: number;
  unit: number;
  isHouseholder: boolean;
  userId: string;
}

export interface CreateResidentResponseView {
  data: CreateResidentResView;
  message: string;
}
