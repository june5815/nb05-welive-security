import {
  createNotificationReceipt,
  markAsRead,
  hiddeneNotification,
  showNotification,
} from "../../../_modules/notification/domain/notification.entity";
import { NotificationReceipt } from "../../../_modules/notification/domain/notification.type";

describe("NotificationEntity", () => {
  // 테스트용 데이터
  const baseReceipt: NotificationReceipt = {
    id: "receipt-001",
    userId: "user-001",
    eventId: "event-001",
    createdAt: new Date("2025-01-01T10:00:00Z"),
    isChecked: false,
    checkedAt: null,
    ishidden: false,
    hiddendenAt: null,
  };

  // createNotificationReceipt 테스트

  describe("createNotificationReceipt", () => {
    it("새로운 NotificationReceipt를 생성해야 한다", () => {
      // Arrange
      const id = "receipt-001";
      const userId = "user-001";
      const eventId = "event-001";

      // Act
      const receipt = createNotificationReceipt(id, userId, eventId);

      // Assert
      expect(receipt.id).toBe(id);
      expect(receipt.userId).toBe(userId);
      expect(receipt.eventId).toBe(eventId);
      expect(receipt.isChecked).toBe(false);
      expect(receipt.checkedAt).toBeNull();
      expect(receipt.ishidden).toBe(false);
      expect(receipt.hiddendenAt).toBeNull();
    });

    it("createdAt이 제공되면 사용해야 한다", () => {
      // Arrange
      const id = "receipt-001";
      const userId = "user-001";
      const eventId = "event-001";
      const createdAt = new Date("2025-01-05T12:30:00Z");

      // Act
      const receipt = createNotificationReceipt(id, userId, eventId, createdAt);

      // Assert
      expect(receipt.createdAt).toEqual(createdAt);
    });

    it("createdAt이 제공되지 않으면 현재 시간을 사용해야 한다", () => {
      // Arrange
      const id = "receipt-001";
      const userId = "user-001";
      const eventId = "event-001";
      const beforeCreate = new Date();

      // Act
      const receipt = createNotificationReceipt(id, userId, eventId);
      const afterCreate = new Date();

      // Assert
      expect(receipt.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(receipt.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it("생성된 알림은 읽지 않은 상태여야 한다", () => {
      // Act
      const receipt = createNotificationReceipt(
        "receipt-001",
        "user-001",
        "event-001",
      );

      // Assert
      expect(receipt.isChecked).toBe(false);
      expect(receipt.checkedAt).toBeNull();
    });

    it("생성된 알림은 숨겨지지 않은 상태여야 한다", () => {
      // Act
      const receipt = createNotificationReceipt(
        "receipt-001",
        "user-001",
        "event-001",
      );

      // Assert
      expect(receipt.ishidden).toBe(false);
      expect(receipt.hiddendenAt).toBeNull();
    });
  });

  // markAsRead 테스트

  describe("markAsRead", () => {
    it("알림을 읽음 상태로 변경해야 한다", () => {
      // Act
      const result = markAsRead(baseReceipt);

      // Assert
      expect(result.isChecked).toBe(true);
      expect(result.checkedAt).not.toBeNull();
    });

    it("checkedAt에 현재 시간을 설정해야 한다", () => {
      // Arrange
      const beforeMark = new Date();

      // Act
      const result = markAsRead(baseReceipt);
      const afterMark = new Date();

      // Assert
      expect(result.checkedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime(),
      );
      expect(result.checkedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime(),
      );
    });

    it("다른 속성은 변경하지 않아야 한다", () => {
      // Act
      const result = markAsRead(baseReceipt);

      // Assert
      expect(result.id).toBe(baseReceipt.id);
      expect(result.userId).toBe(baseReceipt.userId);
      expect(result.eventId).toBe(baseReceipt.eventId);
      expect(result.createdAt).toEqual(baseReceipt.createdAt);
      expect(result.ishidden).toBe(baseReceipt.ishidden);
      expect(result.hiddendenAt).toBe(baseReceipt.hiddendenAt);
    });

    it("원본 객체를 변경하지 않아야 한다 (불변성)", () => {
      // Arrange
      const originalChecked = baseReceipt.isChecked;
      const originalCheckedAt = baseReceipt.checkedAt;

      // Act
      const result = markAsRead(baseReceipt);

      // Assert
      expect(baseReceipt.isChecked).toBe(originalChecked);
      expect(baseReceipt.checkedAt).toBe(originalCheckedAt);
      expect(result).not.toBe(baseReceipt);
    });

    it("이미 읽은 알림을 다시 읽음 처리할 수 있어야 한다", () => {
      // Arrange
      const readReceipt: NotificationReceipt = {
        ...baseReceipt,
        isChecked: true,
        checkedAt: new Date("2025-01-01T11:00:00Z"),
      };
      const beforeSecondMark = new Date();

      // Act
      const result = markAsRead(readReceipt);
      const afterSecondMark = new Date();

      // Assert
      expect(result.isChecked).toBe(true);
      // 새로운 checkedAt이 설정되어야 함
      expect(result.checkedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeSecondMark.getTime(),
      );
      expect(result.checkedAt!.getTime()).toBeLessThanOrEqual(
        afterSecondMark.getTime(),
      );
      // 원래 checkedAt과는 다름
      expect(result.checkedAt).not.toEqual(readReceipt.checkedAt);
    });
  });

  // hiddeneNotification 테스트

  describe("hiddeneNotification", () => {
    it("알림을 숨김 상태로 변경해야 한다", () => {
      // Act
      const result = hiddeneNotification(baseReceipt);

      // Assert
      expect(result.ishidden).toBe(true);
      expect(result.hiddendenAt).not.toBeNull();
    });

    it("hiddendenAt에 현재 시간을 설정해야 한다", () => {
      // Arrange
      const beforeHide = new Date();

      // Act
      const result = hiddeneNotification(baseReceipt);
      const afterHide = new Date();

      // Assert
      expect(result.hiddendenAt!.getTime()).toBeGreaterThanOrEqual(
        beforeHide.getTime(),
      );
      expect(result.hiddendenAt!.getTime()).toBeLessThanOrEqual(
        afterHide.getTime(),
      );
    });

    it("다른 속성은 변경하지 않아야 한다", () => {
      // Act
      const result = hiddeneNotification(baseReceipt);

      // Assert
      expect(result.id).toBe(baseReceipt.id);
      expect(result.userId).toBe(baseReceipt.userId);
      expect(result.eventId).toBe(baseReceipt.eventId);
      expect(result.createdAt).toEqual(baseReceipt.createdAt);
      expect(result.isChecked).toBe(baseReceipt.isChecked);
      expect(result.checkedAt).toBe(baseReceipt.checkedAt);
    });

    it("원본 객체를 변경하지 않아야 한다 (불변성)", () => {
      // Arrange
      const originalHidden = baseReceipt.ishidden;
      const originalHiddenAt = baseReceipt.hiddendenAt;

      // Act
      const result = hiddeneNotification(baseReceipt);

      // Assert
      expect(baseReceipt.ishidden).toBe(originalHidden);
      expect(baseReceipt.hiddendenAt).toBe(originalHiddenAt);
      expect(result).not.toBe(baseReceipt);
    });
  });

  // showNotification 테스트

  describe("showNotification", () => {
    it("숨겨진 알림을 표시 상태로 변경해야 한다", () => {
      // Arrange
      const hiddenReceipt: NotificationReceipt = {
        ...baseReceipt,
        ishidden: true,
        hiddendenAt: new Date("2025-01-01T12:00:00Z"),
      };

      // Act
      const result = showNotification(hiddenReceipt);

      // Assert
      expect(result.ishidden).toBe(false);
      expect(result.hiddendenAt).toBeNull();
    });

    it("이미 표시된 알림을 다시 표시할 수 있어야 한다", () => {
      // Act
      const result = showNotification(baseReceipt);

      // Assert
      expect(result.ishidden).toBe(false);
      expect(result.hiddendenAt).toBeNull();
    });

    it("다른 속성은 변경하지 않아야 한다", () => {
      // Arrange
      const hiddenReceipt: NotificationReceipt = {
        ...baseReceipt,
        ishidden: true,
        hiddendenAt: new Date("2025-01-01T12:00:00Z"),
      };

      // Act
      const result = showNotification(hiddenReceipt);

      // Assert
      expect(result.id).toBe(hiddenReceipt.id);
      expect(result.userId).toBe(hiddenReceipt.userId);
      expect(result.eventId).toBe(hiddenReceipt.eventId);
      expect(result.createdAt).toEqual(hiddenReceipt.createdAt);
      expect(result.isChecked).toBe(hiddenReceipt.isChecked);
      expect(result.checkedAt).toBe(hiddenReceipt.checkedAt);
    });

    it("원본 객체를 변경하지 않아야 한다 (불변성)", () => {
      // Arrange
      const hiddenReceipt: NotificationReceipt = {
        ...baseReceipt,
        ishidden: true,
        hiddendenAt: new Date("2025-01-01T12:00:00Z"),
      };
      const originalHidden = hiddenReceipt.ishidden;
      const originalHiddenAt = hiddenReceipt.hiddendenAt;

      // Act
      const result = showNotification(hiddenReceipt);

      // Assert
      expect(hiddenReceipt.ishidden).toBe(originalHidden);
      expect(hiddenReceipt.hiddendenAt).toBe(originalHiddenAt);
      expect(result).not.toBe(hiddenReceipt);
    });
  });

  // 상태 전환 테스트

  describe("State Transitions", () => {
    it("읽지 않은 → 읽음 → 숨김", () => {
      // Arrange
      const receipt = createNotificationReceipt(
        "receipt-001",
        "user-001",
        "event-001",
      );

      // Act
      const readReceipt = markAsRead(receipt);
      const hiddenReadReceipt = hiddeneNotification(readReceipt);

      // Assert
      expect(hiddenReadReceipt.isChecked).toBe(true);
      expect(hiddenReadReceipt.ishidden).toBe(true);
      expect(hiddenReadReceipt.checkedAt).not.toBeNull();
      expect(hiddenReadReceipt.hiddendenAt).not.toBeNull();
    });

    it("읽음 → 숨김 → 표시", () => {
      // Arrange
      const readReceipt = markAsRead(baseReceipt);

      // Act
      const hiddenReceipt = hiddeneNotification(readReceipt);
      const shownReceipt = showNotification(hiddenReceipt);

      // Assert
      expect(shownReceipt.isChecked).toBe(true); // 읽음 상태 유지
      expect(shownReceipt.ishidden).toBe(false); // 표시 상태
      expect(shownReceipt.checkedAt).not.toBeNull(); // checkedAt 유지
      expect(shownReceipt.hiddendenAt).toBeNull(); // hiddendenAt 초기화
    });

    it("생성 → 숨김 → 읽음 → 표시", () => {
      // Arrange
      const receipt = createNotificationReceipt(
        "receipt-001",
        "user-001",
        "event-001",
      );

      // Act
      const hiddenReceipt = hiddeneNotification(receipt);
      const readHiddenReceipt = markAsRead(hiddenReceipt);
      const finalReceipt = showNotification(readHiddenReceipt);

      // Assert
      expect(finalReceipt.isChecked).toBe(true);
      expect(finalReceipt.ishidden).toBe(false);
      expect(finalReceipt.checkedAt).not.toBeNull();
      expect(finalReceipt.hiddendenAt).toBeNull();
    });
  });

  // 불변성 테스트

  describe("Immutability", () => {
    it("모든 엔티티 함수가 새로운 객체를 반환해야 한다", () => {
      // Act
      const markedReceipt = markAsRead(baseReceipt);
      const hiddenReceipt = hiddeneNotification(baseReceipt);
      const shownReceipt = showNotification(baseReceipt);

      // Assert
      expect(markedReceipt).not.toBe(baseReceipt);
      expect(hiddenReceipt).not.toBe(baseReceipt);
      expect(shownReceipt).not.toBe(baseReceipt);
    });

    it("연쇄 작업 후에도 원본은 변경되지 않아야 한다", () => {
      // Arrange
      const originalId = baseReceipt.id;
      const originalUserId = baseReceipt.userId;
      const originalIsChecked = baseReceipt.isChecked;
      const originalIsHidden = baseReceipt.ishidden;

      // Act
      let receipt = baseReceipt;
      receipt = markAsRead(receipt);
      receipt = hiddeneNotification(receipt);
      receipt = showNotification(receipt);
      receipt = markAsRead(receipt);

      // Assert
      expect(baseReceipt.id).toBe(originalId);
      expect(baseReceipt.userId).toBe(originalUserId);
      expect(baseReceipt.isChecked).toBe(originalIsChecked);
      expect(baseReceipt.ishidden).toBe(originalIsHidden);
    });
  });
});
