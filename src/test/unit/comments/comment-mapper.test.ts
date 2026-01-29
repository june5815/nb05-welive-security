import {
  toCommentResponse,
  toCommentListPagedResponse,
} from "../../../_infra/mappers/comment.mapper";

describe("Comment Mapper 테스트", () => {
  const baseComment = {
    id: "comment_1",
    createdAt: new Date("2026-01-28T12:00:00.000Z"),
    updatedAt: new Date("2026-01-28T12:00:00.000Z"),
    content: "테스트 댓글입니다.",
    user: {
      id: "user_1",
      name: "테스트유저",
    },
  };

  test("toCommentResponse - 기본 필드 및 글쓴이 확인", () => {
    const result = toCommentResponse(baseComment as any);

    expect(result).toEqual(
      expect.objectContaining({
        id: "comment_1",
        content: "테스트 댓글입니다.",
        author: {
          id: "user_1",
          name: "테스트유저",
        },
      }),
    );
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  test("toCommentListPagedResponse - 리스트 및 페이징 정보 확인", () => {
    const input = {
      data: [baseComment, { ...baseComment, id: "comment_2" }],
      totalCount: 10,
      page: 1,
      limit: 5,
      hasNext: true,
    };

    const result = toCommentListPagedResponse(input as any);

    expect(result.data).toHaveLength(2);
    expect(result.totalCount).toBe(10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.hasNext).toBe(true);

    expect(result.data[0].id).toBe("comment_1");
    expect(result.data[1].id).toBe("comment_2");
  });
});
