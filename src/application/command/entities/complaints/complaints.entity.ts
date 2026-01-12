/* =========================
 * Complaint Domain Entity
 * ========================= */

export enum ComplaintStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export type ComplaintEntity = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly status: ComplaintStatus;
  readonly isPublic: boolean;
  readonly viewsCount: number;
  readonly userId: string;
  readonly apartmentId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/* =========
 * 생성
 * ========= */

export type CreateComplaintInput = {
  title: string;
  content: string;
  isPublic: boolean;
  status: ComplaintStatus;
  userId: string;
  apartmentId: string;
};

export const create = (input: CreateComplaintInput): ComplaintEntity => ({
  id: crypto.randomUUID(),
  title: input.title,
  content: input.content,
  status: input.status,
  isPublic: input.isPublic,
  viewsCount: 0,
  userId: input.userId,
  apartmentId: input.apartmentId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/* =========
 * 상태 판단
 * ========= */

export const canEdit = (complaint: ComplaintEntity): boolean =>
  complaint.status === ComplaintStatus.PENDING;

export const canDelete = (complaint: ComplaintEntity): boolean =>
  complaint.status === ComplaintStatus.PENDING;

/* =========
 * 상태 변경
 * ========= */

export const updateStatus = (
  complaint: ComplaintEntity,
  status: ComplaintStatus,
): ComplaintEntity => ({
  ...complaint,
  status,
  updatedAt: new Date(),
});

/* =========
 * 내용 수정
 * ========= */

export const updateContent = (
  complaint: ComplaintEntity,
  title: string,
  content: string,
  isPublic: boolean,
): ComplaintEntity => ({
  ...complaint,
  title,
  content,
  isPublic,
  updatedAt: new Date(),
});
