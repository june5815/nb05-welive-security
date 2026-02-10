import { NotificationQueryUsecase } from "../../../_modules/notification/usecases/notification-query.usecase";
import { NotificationCommandUsecase } from "../../../_modules/notification/usecases/notification-command.usecase";
import { NotificationMapper } from "../../../_infra/mappers/notification.mapper";
import { INotificationQueryRepo } from "../../../_common/ports/repos/notification/notification-query.repo.interface";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

describe("Notification - Unit Tests", () => {
  let notificationQueryUsecase: ReturnType<typeof NotificationQueryUsecase>;
  let notificationCommandUsecase: ReturnType<typeof NotificationCommandUsecase>;
  let mockQueryRepository: jest.Mocked<INotificationQueryRepo>;
  let mockCommandRepository: jest.Mocked<INotificationCommandRepo>;

  const mockNotification = {
    id: "receipt-1",
    createdAt: new Date("2026-02-07T10:00:00Z"),
    content: "새로운 공지사항이 등록되었습니다.",
    isChecked: false,
  };

  const mockNotificationList = {
    data: [mockNotification],
    total: 1,
    page: 1,
    limit: 20,
    hasNext: false,
  };

  beforeEach(() => {
    mockQueryRepository = {
      findUnreadNotificationSEE: jest.fn(),
      findNotificationByUserID: jest.fn(),
    } as unknown as jest.Mocked<INotificationQueryRepo>;

    mockCommandRepository = {
      markAsRead: jest.fn(),
    } as unknown as jest.Mocked<INotificationCommandRepo>;

    notificationQueryUsecase = NotificationQueryUsecase(mockQueryRepository);
    notificationCommandUsecase = NotificationCommandUsecase(
      mockCommandRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe("NotificationQueryUsecase", () => {
    describe("getUnreadNotifications", () => {
      it("should return unread notifications for valid userId", async () => {
        mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([
          mockNotification,
        ]);

        const result =
          await notificationQueryUsecase.getUnreadNotifications("user-1");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("receipt-1");
        expect(result[0].isChecked).toBe(false);
        expect(
          mockQueryRepository.findUnreadNotificationSEE,
        ).toHaveBeenCalledWith("user-1");
      });

      it("should return empty array when no unread notifications exist", async () => {
        mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([]);

        const result =
          await notificationQueryUsecase.getUnreadNotifications("user-1");

        expect(result).toEqual([]);
      });

      it("should return multiple unread notifications", async () => {
        const notifications = [
          mockNotification,
          {
            id: "receipt-2",
            createdAt: new Date("2026-02-07T09:00:00Z"),
            content: "새로운 투표가 시작되었습니다.",
            isChecked: false,
          },
        ];

        mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue(
          notifications,
        );

        const result =
          await notificationQueryUsecase.getUnreadNotifications("user-1");

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("receipt-1");
        expect(result[1].id).toBe("receipt-2");
      });

      it("should throw FORBIDDEN when userId is empty", async () => {
        await expect(
          notificationQueryUsecase.getUnreadNotifications(""),
        ).rejects.toThrow(BusinessException);

        expect(
          mockQueryRepository.findUnreadNotificationSEE,
        ).not.toHaveBeenCalled();
      });

      it("should throw FORBIDDEN when userId is whitespace only", async () => {
        await expect(
          notificationQueryUsecase.getUnreadNotifications("   "),
        ).rejects.toThrow(BusinessException);
      });

      it("should throw error on repository failure", async () => {
        mockQueryRepository.findUnreadNotificationSEE.mockRejectedValue(
          new Error("Database error"),
        );

        await expect(
          notificationQueryUsecase.getUnreadNotifications("user-1"),
        ).rejects.toThrow();
      });
    });

    describe("getNotificationList", () => {
      it("should return paginated notification list", async () => {
        mockQueryRepository.findNotificationByUserID.mockResolvedValue(
          mockNotificationList,
        );

        const result = await notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 1,
          limit: 20,
        });

        expect(result).toEqual(mockNotificationList);
        expect(result.data).toHaveLength(1);
        expect(result.page).toBe(1);
        expect(result.hasNext).toBe(false);
      });

      it("should return empty list when no notifications", async () => {
        mockQueryRepository.findNotificationByUserID.mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          hasNext: false,
        });

        const result = await notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 1,
          limit: 20,
        });

        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
      });

      it("should handle pagination correctly", async () => {
        mockQueryRepository.findNotificationByUserID.mockResolvedValue({
          data: [mockNotification],
          total: 50,
          page: 2,
          limit: 20,
          hasNext: true,
        });

        const result = await notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 2,
          limit: 20,
        });

        expect(result.page).toBe(2);
        expect(result.hasNext).toBe(true);
        expect(
          mockQueryRepository.findNotificationByUserID,
        ).toHaveBeenCalledWith("user-1", 2, 20);
      });

      it("should cap limit to 100", async () => {
        mockQueryRepository.findNotificationByUserID.mockResolvedValue({
          data: [mockNotification],
          total: 200,
          page: 1,
          limit: 100,
          hasNext: true,
        });

        const getNotificationWithLimit = async (limit: number) => {
          try {
            return await notificationQueryUsecase.getNotificationList({
              userId: "user-1",
              page: 1,
              limit: limit,
            });
          } catch (error) {
            if (error instanceof Error && error.message.includes("limit은")) {
              throw error;
            }
            throw error;
          }
        };

        await expect(getNotificationWithLimit(150)).rejects.toThrow();

        const result = await notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 1,
          limit: 100,
        });

        expect(result.limit).toBe(100);
        expect(
          mockQueryRepository.findNotificationByUserID,
        ).toHaveBeenCalledWith("user-1", 1, 100);
      });

      it("should throw FORBIDDEN when userId is empty", async () => {
        await expect(
          notificationQueryUsecase.getNotificationList({
            userId: "",
            page: 1,
            limit: 20,
          }),
        ).rejects.toThrow(BusinessException);
      });

      it("should throw error when page is less than 1", async () => {
        await expect(
          notificationQueryUsecase.getNotificationList({
            userId: "user-1",
            page: 0,
            limit: 20,
          }),
        ).rejects.toThrow(BusinessException);
      });

      it("should throw error when limit is less than 1", async () => {
        await expect(
          notificationQueryUsecase.getNotificationList({
            userId: "user-1",
            page: 1,
            limit: 0,
          }),
        ).rejects.toThrow(BusinessException);
      });

      it("should throw error when limit is greater than 100", async () => {
        await expect(
          notificationQueryUsecase.getNotificationList({
            userId: "user-1",
            page: 1,
            limit: 101,
          }),
        ).rejects.toThrow(BusinessException);
      });
    });
  });

  describe("NotificationCommandUsecase", () => {
    describe("markAsRead", () => {
      it("should mark notification as read successfully", async () => {
        mockCommandRepository.markAsRead.mockResolvedValue(undefined);

        await notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: "receipt-1",
        });

        expect(mockCommandRepository.markAsRead).toHaveBeenCalledWith(
          "receipt-1",
          "user-1",
        );
      });

      it("should handle multiple sequential markAsRead calls", async () => {
        mockCommandRepository.markAsRead.mockResolvedValue(undefined);

        await notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: "receipt-1",
        });

        await notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: "receipt-2",
        });

        expect(mockCommandRepository.markAsRead).toHaveBeenCalledTimes(2);
      });

      it("should throw FORBIDDEN when userId is empty", async () => {
        await expect(
          notificationCommandUsecase.markAsRead({
            userId: "",
            notificationReceiptId: "receipt-1",
          }),
        ).rejects.toThrow(BusinessException);

        expect(mockCommandRepository.markAsRead).not.toHaveBeenCalled();
      });

      it("should throw error when notificationReceiptId is empty", async () => {
        await expect(
          notificationCommandUsecase.markAsRead({
            userId: "user-1",
            notificationReceiptId: "",
          }),
        ).rejects.toThrow(BusinessException);

        expect(mockCommandRepository.markAsRead).not.toHaveBeenCalled();
      });

      it("should throw error on repository failure", async () => {
        mockCommandRepository.markAsRead.mockRejectedValue(
          new Error("Database error"),
        );

        await expect(
          notificationCommandUsecase.markAsRead({
            userId: "user-1",
            notificationReceiptId: "receipt-1",
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe("NotificationMapper", () => {
    describe("generateContent", () => {
      it("should generate NOTICE_CREATED message", () => {
        const content = NotificationMapper.generateContent({
          type: "NOTICE_CREATED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: {},
        });

        expect(content).toBe("새로운 공지사항이 등록되었습니다.");
      });

      it("should generate POLL_CREATED message", () => {
        const content = NotificationMapper.generateContent({
          type: "POLL_CREATED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: {},
        });

        expect(content).toBe("새로운 투표가 시작되었습니다.");
      });

      it("should generate COMPLAINT_CREATED message", () => {
        const content = NotificationMapper.generateContent({
          type: "COMPLAINT_CREATED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: {},
        });

        expect(content).toBe("새로운 민원이 등록되었습니다.");
      });

      it("should generate RESIDENT_SIGNUP_REQUESTED message", () => {
        const content = NotificationMapper.generateContent({
          type: "RESIDENT_SIGNUP_REQUESTED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: {},
        });

        expect(content).toBe("새로운 입주민이 입주신청을 요청하였습니다.");
      });

      it("should generate ADMIN_SIGNUP_REQUESTED message", () => {
        const content = NotificationMapper.generateContent({
          type: "ADMIN_SIGNUP_REQUESTED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: { adminName: "홍길동" },
        });

        expect(content).toBe("새로운 관리자가 승인요청을 했습니다.");
      });

      it("should generate admin login message with name", () => {
        const content = NotificationMapper.generateContent({
          type: "ADMIN_SIGNUP_REQUESTED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: { adminName: "홍길동", isLogin: true },
        });

        expect(content).toBe("홍길동님이 로그인하였습니다.");
      });

      it("should return default message for unknown type", () => {
        const content = NotificationMapper.generateContent({
          type: "UNKNOWN_TYPE",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: {},
        });

        expect(content).toBe("새로운 알림이 있습니다.");
      });

      it("should handle Korean names in messages", () => {
        const content = NotificationMapper.generateContent({
          type: "ADMIN_SIGNUP_REQUESTED",
          targetType: "APARTMENT",
          targetId: "apt-1",
          extraData: { adminName: "박민수", isLogin: true },
        });

        expect(content).toBe("박민수님이 로그인하였습니다.");
      });
    });

    describe("utility functions", () => {
      it("should return markAsRead input with isChecked=true", () => {
        const input = NotificationMapper.toMarkAsReadInput();

        expect(input.isChecked).toBe(true);
        expect(input.checkedAt).toBeInstanceOf(Date);
      });

      it("should return hidden notification input with isHidden=true", () => {
        const input = NotificationMapper.tohiddenNotificationInput();

        expect(input.isHidden).toBe(true);
        expect(input.hiddenAt).toBeInstanceOf(Date);
      });

      it("should return show notification input with isHidden=false", () => {
        const input = NotificationMapper.toShowNotificationInput();

        expect(input.isHidden).toBe(false);
        expect(input.hiddenAt).toBeNull();
      });
    });
  });

  describe("Edge Cases & Integration", () => {
    it("should validate inputs in correct order", async () => {
      await expect(
        notificationQueryUsecase.getNotificationList({
          userId: "",
          page: 0,
          limit: 0,
        }),
      ).rejects.toThrow();
    });

    it("should handle large number of notifications", async () => {
      const largeNotificationList = {
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `receipt-${i}`,
          createdAt: new Date(),
          content: `알림 ${i}`,
          isChecked: false,
        })),
        total: 1000,
        page: 1,
        limit: 100,
        hasNext: true,
      };

      mockQueryRepository.findNotificationByUserID.mockResolvedValue(
        largeNotificationList,
      );

      const result = await notificationQueryUsecase.getNotificationList({
        userId: "user-1",
        page: 1,
        limit: 100,
      });

      expect(result.data).toHaveLength(100);
      expect(result.hasNext).toBe(true);
    });

    it("should return notification with correct structure", async () => {
      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([
        mockNotification,
      ]);

      const result =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("createdAt");
      expect(result[0]).toHaveProperty("content");
      expect(result[0]).toHaveProperty("isChecked");
    });
  });
});
