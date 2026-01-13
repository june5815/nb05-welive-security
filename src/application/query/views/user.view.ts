export type JoinStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * admin과 resident 공통 인터페이스 (super admin 제외)
 */
export interface ProfileView {
  id: string;
  username: string;
  contact: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AdminView {
  email: string;
  contact: string;
  name: string;
  adminOf: {
    name: string;
    address: string;
    description: string;
    officeNumber: string;
  };
}

export interface AdminListReq {
  page: number;
  limit: number;
  searchKeyword?: string;
  joinStatus?: JoinStatus;
}

export interface AdminItemView {
  id: string;
  email: string;
  contact: string;
  name: string;
  joinStatus: JoinStatus;
  adminOf: {
    id: string;
    name: string;
    address: string;
    description: string;
    officeNumber: string;
  };
}

export interface AdminListResView {
  data: AdminItemView[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface ResidentUserListReq {
  page: number;
  limit: number;
  searchKeyword?: string;
  joinStatus?: JoinStatus;
  building?: number;
  unit?: number;
}

export interface ResidentItemView {
  id: string;
  email: string;
  contact: string;
  name: string;
  joinStatus: JoinStatus;
  resident: {
    id: string;
    building: string;
    unit: string;
  };
}

export interface ResidentUserListResView {
  data: ResidentItemView[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
