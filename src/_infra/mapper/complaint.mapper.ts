import { Prisma } from "@prisma/client";
import {
  Complaint,
  ComplaintEntity,
} from "../../application/command/entities/complaints/complaints.entity";

export const complaintInclude = Prisma.validator<Prisma.ComplaintInclude>()({
  user: true,
  apartment: true,
});

export type ComplaintModel = Prisma.ComplaintGetPayload<{
  include: typeof complaintInclude;
}>;

export const ComplaintMapper = {
  toCreate(entity: Complaint): Prisma.ComplaintCreateInput {
    return {
      title: entity.title,
      content: entity.content,
      isPublic: entity.isPublic,
      status: entity.status!,
      user: {
        connect: { id: entity.userId },
      },
      apartment: {
        connect: { id: entity.apartmentId },
      },
    };
  },

  toUpdate(entity: Complaint): Prisma.ComplaintUpdateInput {
    return {
      title: entity.title,
      content: entity.content,
      isPublic: entity.isPublic,
      status: entity.status,
      version: { increment: 1 },
    };
  },

  toEntity(model: ComplaintModel): Complaint {
    return ComplaintEntity.restore({
      id: model.id,
      title: model.title,
      content: model.content,
      status: model.status,
      isPublic: model.isPublic,
      viewsCount: model.viewsCount,
      userId: model.userId,
      apartmentId: model.apartmentId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      version: model.version,
    });
  },
};
