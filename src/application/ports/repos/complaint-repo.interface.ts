import { ComplaintEntity } from "../../command/entities/complaints/complaints.entity";

export type ComplaintRepository = {
  // 민원 단건 조회
  readonly findById: (id: string) => Promise<ComplaintEntity | null>;

  // 민원 목록 조회 (아파트 기준)
  readonly findByApartment: (
    apartmentId: string,
    page: number,
    limit: number,
  ) => Promise<{
    data: ComplaintEntity[];
    totalCount: number;
  }>;

  // 민원 생성
  readonly create: (complaint: ComplaintEntity) => Promise<ComplaintEntity>;

  // 민원 수정
  readonly update: (
    id: string,
    complaint: Partial<ComplaintEntity>,
  ) => Promise<ComplaintEntity>;

  // 민원 삭제
  readonly delete: (id: string) => Promise<void>;
};
