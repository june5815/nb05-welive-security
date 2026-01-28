import { CommentResourceType, UserRole } from "@prisma/client";

export interface CreateCommentCommand {
  content: string;
  resourceId: string;
  resourceType: CommentResourceType;
  userId: string;
}

export interface CommentCommandRepository {
  create(command: {
    content: string;
    resourceId: string;
    resourceType: CommentResourceType;
    userId: string;
  }): Promise<any>;

  findById(commentId: string): Promise<{ id: string; userId: string } | null>;

  update(commentId: string, content: string): Promise<void>;

  delete(commentId: string): Promise<void>;
}

export type Actor = { id: string; role: UserRole };
