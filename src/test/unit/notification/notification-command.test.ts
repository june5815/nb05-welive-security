import { NotificationCommandUsecase } from "../../../_modules/notification/usecases/notification-command.usecase";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../_common/exceptions/technical.exception";

describe("NotificationCommandUsecase", () => {
  let usecase: ReturnType<typeof NotificationCommandUsecase>;

  // Mock Repository
  const mockNotificationCommandRepo = {
    markAsRead: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = NotificationCommandUsecase(mockNotificationCommandRepo as any);
  });

  // markAsRead 테스트

  describe("markAsRead", () => {
    it("유효한 요청으로 알림을 읽음 처리해야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "notif-receipt-001",
      };
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      await usecase.markAsRead(req);

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledWith(
        "notif-receipt-001",
      );
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(1);
    });

    it("빈 userId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = {
        userId: "   ",
        notificationReceiptId: "notif-receipt-001",
      };

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("undefined userId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = {
        userId: undefined,
        notificationReceiptId: "notif-receipt-001",
      } as any;

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("빈 notificationReceiptId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "   ",
      };

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("undefined notificationReceiptId가 주어지면 BusinessException을 던져야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: undefined,
      } as any;

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("Repository에서 예외가 발생하면 TechnicalException으로 변환해야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "notif-receipt-001",
      };
      const dbError = new Error("Database update failed");
      mockNotificationCommandRepo.markAsRead.mockRejectedValue(dbError);

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(TechnicalException);
    });

    it("BusinessException은 그대로 전파해야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "notif-receipt-001",
      };
      const businessError = new BusinessException({
        type: BusinessExceptionType.NOT_FOUND,
        error: new Error("Notification not found"),
      });
      mockNotificationCommandRepo.markAsRead.mockRejectedValue(businessError);

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(businessError);
    });

    it("여러 알림을 연속해서 읽음 처리할 수 있어야 한다", async () => {
      // Arrange
      const req1 = {
        userId: "user-001",
        notificationReceiptId: "notif-001",
      };
      const req2 = {
        userId: "user-001",
        notificationReceiptId: "notif-002",
      };
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      await usecase.markAsRead(req1);
      await usecase.markAsRead(req2);

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(2);
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenNthCalledWith(
        1,
        "notif-001",
      );
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenNthCalledWith(
        2,
        "notif-002",
      );
    });

    it("UUID 형식의 ID를 처리할 수 있어야 한다", async () => {
      // Arrange
      const req = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        notificationReceiptId: "660e8400-e29b-41d4-a716-446655440001",
      };
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      await usecase.markAsRead(req);

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledWith(
        "660e8400-e29b-41d4-a716-446655440001",
      );
    });

    it("한 사용자의 여러 알림을 처리할 수 있어야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const notifications = [
        { userId, notificationReceiptId: "notif-001" },
        { userId, notificationReceiptId: "notif-002" },
        { userId, notificationReceiptId: "notif-003" },
      ];
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      for (const req of notifications) {
        await usecase.markAsRead(req);
      }

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(3);
      notifications.forEach((notif, index) => {
        expect(mockNotificationCommandRepo.markAsRead).toHaveBeenNthCalledWith(
          index + 1,
          notif.notificationReceiptId,
        );
      });
    });

    it("빈 userId와 notificationReceiptId 모두 검증해야 한다", async () => {
      // Arrange
      const req = {
        userId: "   ",
        notificationReceiptId: "   ",
      };

      // Act & Assert
      // userId가 먼저 검증되므로 userId 에러가 발생
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("userId는 유효하지만 notificationReceiptId가 빈 경우", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "   ",
      };

      // Act & Assert
      await expect(usecase.markAsRead(req)).rejects.toThrow(BusinessException);
      expect(mockNotificationCommandRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("양쪽 모두 유효한 경우에만 Repository를 호출해야 한다", async () => {
      // Arrange
      const validReq = {
        userId: "user-valid",
        notificationReceiptId: "notif-valid",
      };
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      await usecase.markAsRead(validReq);

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(1);
    });
  });

  // 통합 테스트

  describe("Integration Tests", () => {
    it("여러 사용자의 알림을 독립적으로 처리할 수 있어야 한다", async () => {
      // Arrange
      const user1Req = {
        userId: "user-001",
        notificationReceiptId: "notif-user1-001",
      };
      const user2Req = {
        userId: "user-002",
        notificationReceiptId: "notif-user2-001",
      };
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      await usecase.markAsRead(user1Req);
      await usecase.markAsRead(user2Req);

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(2);
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenNthCalledWith(
        1,
        "notif-user1-001",
      );
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenNthCalledWith(
        2,
        "notif-user2-001",
      );
    });

    it("동일한 userId로 여러 알림을 처리할 수 있어야 한다", async () => {
      // Arrange
      const userId = "user-001";
      const notifications = [
        { userId, notificationReceiptId: "notif-001" },
        { userId, notificationReceiptId: "notif-002" },
      ];
      mockNotificationCommandRepo.markAsRead.mockResolvedValue(undefined);

      // Act
      for (const req of notifications) {
        await usecase.markAsRead(req);
      }

      // Assert
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(2);
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledWith(
        "notif-001",
      );
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledWith(
        "notif-002",
      );
    });

    it("Repository 실패 후 재시도할 수 있어야 한다", async () => {
      // Arrange
      const req = {
        userId: "user-001",
        notificationReceiptId: "notif-001",
      };
      // 첫 번째는 실패, 두 번째는 성공
      mockNotificationCommandRepo.markAsRead
        .mockRejectedValueOnce(
          new TechnicalException({
            type: TechnicalExceptionType.UNKNOWN_SERVER_ERROR,
            error: new Error("Temporary DB error"),
          }),
        )
        .mockResolvedValueOnce(undefined);

      // Act & Assert
      // 첫 번째 시도: 실패
      await expect(usecase.markAsRead(req)).rejects.toThrow(TechnicalException);

      // 두 번째 시도: 성공
      await usecase.markAsRead(req);
      expect(mockNotificationCommandRepo.markAsRead).toHaveBeenCalledTimes(2);
    });
  });
});
