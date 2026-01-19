import { CommentResourceType } from "@prisma/client";

export interface CommentEntity {
  content: string;
  resourceType: CommentResourceType; // NOTICE | COMPLAINT
  resourceId: string;
  userId: string;
}
