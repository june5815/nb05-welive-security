export interface CommentAuthorDto {
  id: string;
  name: string;
}

export interface CommentResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  author: CommentAuthorDto;
}

type CommentSource = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  user: {
    id: string;
    name: string;
  };
};

export const toCommentResponse = (
  comment: CommentSource,
): CommentResponseDto => ({
  id: comment.id,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  content: comment.content,
  author: {
    id: comment.user.id,
    name: comment.user.name,
  },
});

export const toCommentListResponse = (comments: CommentSource[]) =>
  comments.map(toCommentResponse);

export const toCommentListPagedResponse = (args: {
  data: CommentSource[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}) => ({
  data: toCommentListResponse(args.data),
  totalCount: args.totalCount,
  page: args.page,
  limit: args.limit,
  hasNext: args.hasNext,
});
