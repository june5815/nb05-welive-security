import { NoticeType } from "@prisma/client";

import {
  toNoticeListPagedResponse,
  toNoticeResponse,
} from "../../../_infra/mappers/notice.mapper";

describe("공지사항mapper 테스트", () => {
  const baseNotice = {
    id: "notice_1",
    createdAt: new Date("2026-01-20T13:27:02.928Z"),
    updatedAt: new Date("2026-01-20T13:27:02.928Z"),
    title: "공지 제목",
    content: "공지 내용",
    category: "MAINTENANCE",
    type: NoticeType.IMPORTANT,
    viewCount: 7,
    apartmentId: "apt_1",
    user: {
      id: "user_1",
      name: "관리자",
    },
    commentCount: 3,
  };

  test("toNoticeResponse - Swagger 응답 키로 매핑 (isPinned/viewsCount/author)", () => {
    const result = toNoticeResponse(baseNotice as any);

    expect(result).toEqual(
      expect.objectContaining({
        id: baseNotice.id,
        title: baseNotice.title,
        content: baseNotice.content,
        category: baseNotice.category,
        apartmentId: baseNotice.apartmentId,

        isPinned: true,
        viewsCount: baseNotice.viewCount,
        author: {
          id: baseNotice.user.id,
          name: baseNotice.user.name,
        },

        commentCount: baseNotice.commentCount,
      }),
    );
  });

  test("toNoticeResponse - event가 없으면 event는 null", () => {
    const result = toNoticeResponse({
      ...(baseNotice as any),
      event: null,
    });

    expect(result.event).toBeNull();
  });

  test("toNoticeResponse - event가 있으면 id/startDate/endDate로", () => {
    const event = {
      id: "event_1",
      startDate: new Date("2026-01-20T13:27:02.936Z"),
      endDate: new Date("2026-01-20T13:27:02.936Z"),
    };

    const result = toNoticeResponse({
      ...(baseNotice as any),
      event,
    });

    expect(result.event).toEqual(
      expect.objectContaining({
        id: event.id,
        startDate: event.startDate,
        endDate: event.endDate,
      }),
    );
  });

  test("toNoticeListPagedResponse - Swagger 리스트 포맷(data/totalCount/page/limit/hasNext)으로 매핑", () => {
    const items = [
      { ...(baseNotice as any), id: "notice_1", type: NoticeType.IMPORTANT },
      { ...(baseNotice as any), id: "notice_2", type: NoticeType.NORMAL },
    ];

    const input = {
      data: items,
      total: 41,
      page: 1,
      limit: 20,
    };

    const result = toNoticeListPagedResponse(input as any);

    expect(result).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        totalCount: 41,
        page: 1,
        limit: 20,
        hasNext: true,
      }),
    );

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: "notice_1",
        isPinned: true,
        viewsCount: baseNotice.viewCount,
        author: expect.objectContaining({
          id: baseNotice.user.id,
          name: baseNotice.user.name,
        }),
      }),
    );
    expect(result.data[1]).toEqual(
      expect.objectContaining({
        id: "notice_2",
        isPinned: false,
      }),
    );
  });
});
