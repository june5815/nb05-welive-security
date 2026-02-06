import { NotificationQueryUsecase } from "../../../_modules/notification/usecases/notification-query.usecase";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";
import { Notification } from "../../../_common/ports/repos/notification/notification-query.repo.interface";

describe("NotificationQueryUsecase", () => {
  let usecase: ReturnType<typeof NotificationQueryUsecase>;

  // Mock Repository
  const mockNotificationQueryRepo = {
    findUnreadNotificationSEE: jest.fn(),
    findNotificationByUserID: jest.fn(),
  };

  // 테스트용 알림 데이터
  const mockNotification: Notification = {
    id: "notif-001",
    content: "새로운 공지사항이 등록되었습니다.",
    createdAt: new Date("2025-01-01T10:00:00Z"),
    isChecked: false,
  };

  const mockReadNotification: Notification = {
    id: "notif-002",
    content: "설문조사 참여 요청입니다.",
    createdAt: new Date("2025-01-02T10:00:00Z"),
    isChecked: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = NotificationQueryUsecase(mockNotificationQueryRepo as any);
  });

  // getUnreadNotifications 테스트

  describe("getUnreadNotifications", () => {
    it("유효한 userId로 읽지 않은 알림 목록을 조회해야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const unreadNotifications = [mockNotification];
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockResolvedValue(
        unreadNotifications,
      );

      // Act
      const result = await usecase.getUnreadNotifications(userId);

      // Assert
      expect(result).toEqual(unreadNotifications);
      expect(
        mockNotificationQueryRepo.findUnreadNotificationSEE,
      ).toHaveBeenCalledWith(userId);
      expect(
        mockNotificationQueryRepo.findUnreadNotificationSEE,
      ).toHaveBeenCalledTimes(1);
    });

    it("읽은 알림은 포함하지 않아야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const unreadNotifications = [mockNotification]; // isChecked: false만
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockResolvedValue(
        unreadNotifications,
      );

      // Act
      const result = await usecase.getUnreadNotifications(userId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].isChecked).toBe(false);
    });

    it("빈 userId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const userId = "   "; // 빈 문자열

      // Act & Assert
      await expect(usecase.getUnreadNotifications(userId)).rejects.toThrow(
        BusinessException,
      );
    });

    it("undefined userId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Act & Assert
      await expect(
        usecase.getUnreadNotifications(undefined as any),
      ).rejects.toThrow(BusinessException);
    });

    it("Repository 예외는 TechnicalException으로 변환해야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const dbError = new Error("Database connection failed");
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockRejectedValue(
        dbError,
      );

      // Act & Assert
      await expect(usecase.getUnreadNotifications(userId)).rejects.toThrow(
        TechnicalException,
      );
    });

    it("빈 목록을 반환할 수 있어야 한다", async () => {
      // Arrange
      const userId = "user-001";
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockResolvedValue([]);

      // Act
      const result = await usecase.getUnreadNotifications(userId);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("여러 개의 읽지 않은 알림을 반환해야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const unreadNotifications = [
        mockNotification,
        {
          ...mockNotification,
          id: "notif-003",
        },
      ];
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockResolvedValue(
        unreadNotifications,
      );

      // Act
      const result = await usecase.getUnreadNotifications(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((n) => !n.isChecked)).toBe(true);
    });
  });

  // getNotificationList 테스트

  describe("getNotificationList", () => {
    it("유효한 요청으로 알림 목록을 조회해야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 10 };
      const mockResponse = {
        data: [mockNotification, mockReadNotification],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await usecase.getNotificationList(req);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(
        mockNotificationQueryRepo.findNotificationByUserID,
      ).toHaveBeenCalledWith("user-001", 1, 10);
    });

    it("page가 1보다 작으면 1로 조정해야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 0, limit: 10 };
      const mockResponse = {
        data: [mockNotification],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue(
        mockResponse,
      );

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        BusinessException,
      );
    });

    it("page가 음수면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: -5, limit: 10 };

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        BusinessException,
      );
    });

    it("limit이 1보다 작으면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 0 };

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        BusinessException,
      );
    });

    it("limit이 100을 초과하면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 101 };

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        BusinessException,
      );
    });

    it("빈 userId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = { userId: "  ", page: 1, limit: 10 };

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        BusinessException,
      );
    });

    it("Repository 예외는 TechnicalException으로 변환해야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 10 };
      const dbError = new Error("Database query failed");
      mockNotificationQueryRepo.findNotificationByUserID.mockRejectedValue(
        dbError,
      );

      // Act & Assert
      await expect(usecase.getNotificationList(req)).rejects.toThrow(
        TechnicalException,
      );
    });

    it("읽은 알림과 읽지 않은 알림을 모두 포함해야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 10 };
      const mockResponse = {
        data: [mockNotification, mockReadNotification],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await usecase.getNotificationList(req);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].isChecked).toBe(false);
      expect(result.data[1].isChecked).toBe(true);
    });

    it("limit 1로 첫 페이지만 조회해야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 1, limit: 1 };
      const mockResponse = {
        data: [mockNotification],
        total: 10,
        page: 1,
        limit: 1,
        hasNext: true,
      };
      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await usecase.getNotificationList(req);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(10);
    });

    it("페이지네이션 정보가 올바르게 반환되어야 한다", async () => {
      // Arrange
      const req = { userId: "user-001", page: 2, limit: 5 };
      const mockResponse = {
        data: [mockNotification, mockReadNotification],
        total: 8,
        page: 2,
        limit: 5,
        hasNext: false,
      };
      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await usecase.getNotificationList(req);

      // Assert
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(8);
      expect(result.hasNext).toBe(false);
    });
  });

  // 통합 테스트

  describe("Integration Tests", () => {
    it("동일한 사용자의 읽음/미읽음 알림을 모두 처리할 수 있어야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const allNotifications = [mockNotification, mockReadNotification];
      const unreadNotifications = [mockNotification];

      mockNotificationQueryRepo.findNotificationByUserID.mockResolvedValue({
        data: allNotifications,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
      mockNotificationQueryRepo.findUnreadNotificationSEE.mockResolvedValue(
        unreadNotifications,
      );

      // Act
      const allResult = await usecase.getNotificationList({
        userId,
        page: 1,
        limit: 10,
      });
      const unreadResult = await usecase.getUnreadNotifications(userId);

      // Assert
      expect(allResult.data).toHaveLength(2);
      expect(unreadResult).toHaveLength(1);
      expect(unreadResult[0].isChecked).toBe(false);
    });

    it("여러 사용자의 알림을 독립적으로 관리할 수 있어야 한다", async () => {
      // Arrange
      const user1Notifications = [{ ...mockNotification, id: "notif-user1" }];
      const user2Notifications = [
        { ...mockNotification, id: "notif-user2", content: "사용자2의 알림" },
      ];

      mockNotificationQueryRepo.findUnreadNotificationSEE
        .mockResolvedValueOnce(user1Notifications)
        .mockResolvedValueOnce(user2Notifications);

      // Act
      const user1Result = await usecase.getUnreadNotifications("user-001");
      const user2Result = await usecase.getUnreadNotifications("user-002");

      // Assert
      expect(user1Result[0].id).toBe("notif-user1");
      expect(user2Result[0].id).toBe("notif-user2");
      expect(user1Result[0].id).not.toBe(user2Result[0].id);
    });
  });
});
