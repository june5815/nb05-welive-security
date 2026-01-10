import { ComplaintStatus } from "@prisma/client";

// 민원 생성용 Entity 입력 타입
export interface CreateComplaintEntity {
  title: string;
  content: string;
  status: ComplaintStatus; // enum 적용
  isPublic: boolean;
  viewsCount: number;
  userId: string;
  apartmentId: string;
}

export interface ComplaintCreateData {
  title: string;
  content: string;
  status: ComplaintStatus;
  isPublic: boolean;
  viewsCount: number;
  user: {
    connect: {
      id: string;
    };
  };
  apartment: {
    connect: {
      id: string;
    };
  };
}

// 프론트엔드 민원 작성자 타입
export interface ComplaintWriter {
  id: string;
  name: string;
}

// 프론트엔드 민원 응답 타입
export interface ComplaintResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  status: ComplaintStatus;
  isPublic: boolean;
  viewsCount: number;
  apartmentId: string;
  complainant: ComplaintWriter;
  commentCount: number;
}

export const ComplaintMapper = {
  // 민원 생성
  toCreate(entity: CreateComplaintEntity): ComplaintCreateData {
    return {
      title: entity.title,
      content: entity.content,
      status: entity.status,
      isPublic: entity.isPublic,
      viewsCount: entity.viewsCount,
      user: {
        connect: {
          id: entity.userId,
        },
      },
      apartment: {
        connect: {
          id: entity.apartmentId,
        },
      },
    };
  },

  // 민원 단건 응답
  toResponse(complaint: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    status: ComplaintStatus;
    isPublic: boolean;
    viewsCount: number;
    apartmentId: string;
    user: {
      id: string;
      name: string;
    };
    _count: {
      comments: number;
    };
  }): ComplaintResponse {
    return {
      id: complaint.id,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      title: complaint.title,
      content: complaint.content,
      status: complaint.status,
      isPublic: complaint.isPublic,
      viewsCount: complaint.viewsCount,
      apartmentId: complaint.apartmentId,
      complainant: {
        id: complaint.user.id,
        name: complaint.user.name,
      },
      commentCount: complaint._count.comments,
    };
  },
};
