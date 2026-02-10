import { NotificationQueryUsecase } from "../../../_modules/notification/usecases/notification-query.usecase";
import { NotificationCommandUsecase } from "../../../_modules/notification/usecases/notification-command.usecase";
import { NotificationMapper } from "../../../_infra/mappers/notification.mapper";
import { INotificationQueryRepo } from "../../../_common/ports/repos/notification/notification-query.repo.interface";
import { INotificationCommandRepo } from "../../../_common/ports/repos/notification/notification-command.repo.interface";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../_common/exceptions/business.exception";

describe("Notification - Integration Tests", () => {
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

  describe("알림 흐름 통합 테스트", () => {
    it("공지사항 생성 후 알림 받고 읽음 처리하는 전체 흐름", async () => {
      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([
        mockNotification,
      ]);

      const unreadNotifications =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(unreadNotifications).toHaveLength(1);
      expect(unreadNotifications[0].isChecked).toBe(false);
      expect(unreadNotifications[0].content).toBe(
        "새로운 공지사항이 등록되었습니다.",
      );

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

    it("여러 알림 조회 및 개별 읽음 처리", async () => {
      const notification2 = {
        id: "receipt-2",
        createdAt: new Date("2026-02-07T09:00:00Z"),
        content: "새로운 투표가 시작되었습니다.",
        isChecked: false,
      };

      const notification3 = {
        id: "receipt-3",
        createdAt: new Date("2026-02-07T08:00:00Z"),
        content: "새로운 민원이 등록되었습니다.",
        isChecked: false,
      };

      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([
        mockNotification,
        notification2,
        notification3,
      ]);

      const unreadNotifications =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(unreadNotifications).toHaveLength(3);

      mockCommandRepository.markAsRead.mockResolvedValue(undefined);

      for (const notification of unreadNotifications) {
        await notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: notification.id,
        });
      }

      expect(mockCommandRepository.markAsRead).toHaveBeenCalledTimes(3);
    });

    it("페이지네이션을 통한 알림 목록 조회", async () => {
      mockQueryRepository.findNotificationByUserID.mockResolvedValue(
        mockNotificationList,
      );

      const result1 = await notificationQueryUsecase.getNotificationList({
        userId: "user-1",
        page: 1,
        limit: 20,
      });

      expect(result1.page).toBe(1);
      expect(result1.data).toHaveLength(1);
      expect(result1.hasNext).toBe(false);

      mockQueryRepository.findNotificationByUserID.mockResolvedValue({
        data: [],
        total: 1,
        page: 2,
        limit: 20,
        hasNext: false,
      });

      const result2 = await notificationQueryUsecase.getNotificationList({
        userId: "user-1",
        page: 2,
        limit: 20,
      });

      expect(result2.page).toBe(2);
      expect(result2.data).toHaveLength(0);
    });
  });

  describe("알림 메시지 타입별 테스트", () => {
    it("공지사항 생성 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "NOTICE_CREATED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: {},
      });

      expect(content).toBe("새로운 공지사항이 등록되었습니다.");
    });

    it("투표 생성 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "POLL_CREATED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: {},
      });

      expect(content).toBe("새로운 투표가 시작되었습니다.");
    });

    it("민원 생성 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "COMPLAINT_CREATED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: {},
      });

      expect(content).toBe("새로운 민원이 등록되었습니다.");
    });

    it("입주민 가입 신청 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "RESIDENT_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: {},
      });

      expect(content).toBe("새로운 입주민이 입주신청을 요청하였습니다.");
    });

    it("관리자 가입 신청 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "ADMIN_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: { adminName: "홍길동" },
      });

      expect(content).toBe("새로운 관리자가 승인요청을 했습니다.");
    });

    it("관리자 로그인 알림 메시지", () => {
      const content = NotificationMapper.generateContent({
        type: "ADMIN_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: { adminName: "홍길동", isLogin: true },
      });

      expect(content).toBe("홍길동님이 로그인하였습니다.");
    });
  });

  describe("에러 처리 및 검증", () => {
    it("빈 userId로 조회 시 에러 발생", async () => {
      await expect(
        notificationQueryUsecase.getUnreadNotifications(""),
      ).rejects.toThrow(BusinessException);
    });

    it("page < 1로 조회 시 에러 발생", async () => {
      await expect(
        notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 0,
          limit: 20,
        }),
      ).rejects.toThrow(BusinessException);
    });

    it("limit > 100으로 조회 시 에러 발생", async () => {
      await expect(
        notificationQueryUsecase.getNotificationList({
          userId: "user-1",
          page: 1,
          limit: 101,
        }),
      ).rejects.toThrow(BusinessException);
    });

    it("빈 notificationReceiptId로 읽음 처리 시 에러 발생", async () => {
      await expect(
        notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: "",
        }),
      ).rejects.toThrow(BusinessException);
    });

    it("Repository 에러 발생 시 예외 전파", async () => {
      mockQueryRepository.findUnreadNotificationSEE.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        notificationQueryUsecase.getUnreadNotifications("user-1"),
      ).rejects.toThrow();
    });
  });

  describe("Mapper 유틸리티 함수 테스트", () => {
    it("toMarkAsReadInput은 isChecked=true와 checkedAt을 반환", () => {
      const input = NotificationMapper.toMarkAsReadInput();

      expect(input.isChecked).toBe(true);
      expect(input.checkedAt).toBeInstanceOf(Date);
    });

    it("toHiddenNotificationInput은 isHidden=true와 hiddenAt을 반환", () => {
      const input = NotificationMapper.tohiddenNotificationInput();

      expect(input.isHidden).toBe(true);
      expect(input.hiddenAt).toBeInstanceOf(Date);
    });

    it("toShowNotificationInput은 isHidden=false와 hiddenAt=null을 반환", () => {
      const input = NotificationMapper.toShowNotificationInput();

      expect(input.isHidden).toBe(false);
      expect(input.hiddenAt).toBeNull();
    });
  });

  describe("엣지 케이스", () => {
    it("많은 수의 알림을 조회할 수 있음", async () => {
      const manyNotifications = Array.from({ length: 100 }, (_, i) => ({
        id: `receipt-${i}`,
        createdAt: new Date(),
        content: `알림 ${i}`,
        isChecked: false,
      }));

      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue(
        manyNotifications,
      );

      const result =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(result).toHaveLength(100);
    });

    it("알림이 없으면 빈 배열 반환", async () => {
      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([]);

      const result =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(result).toEqual([]);
    });

    it("특수문자가 포함된 관리자 이름 처리", () => {
      const content = NotificationMapper.generateContent({
        type: "ADMIN_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: { adminName: "O'Brien-Smith", isLogin: true },
      });

      expect(content).toBe("O'Brien-Smith님이 로그인하였습니다.");
    });

    it("한글 이름의 관리자 로그인 알림", () => {
      const content = NotificationMapper.generateContent({
        type: "ADMIN_SIGNUP_REQUESTED",
        targetType: "APARTMENT",
        targetId: "apt-1",
        extraData: { adminName: "박민수", isLogin: true },
      });

      expect(content).toBe("박민수님이 로그인하였습니다.");
    });

    it("알림의 createdAt은 유효한 Date 객체", async () => {
      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue([
        mockNotification,
      ]);

      const result =
        await notificationQueryUsecase.getUnreadNotifications("user-1");

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.getTime()).toBeGreaterThan(0);
    });

    it("매우 큰 페이지 번호도 처리 가능", async () => {
      mockQueryRepository.findNotificationByUserID.mockResolvedValue({
        data: [],
        total: 0,
        page: 9999,
        limit: 20,
        hasNext: false,
      });

      const result = await notificationQueryUsecase.getNotificationList({
        userId: "user-1",
        page: 9999,
        limit: 20,
      });

      expect(result.page).toBe(9999);
    });
  });

  describe("성능 테스트", () => {
    it("대량의 알림을 순차적으로 읽음 처리", async () => {
      mockCommandRepository.markAsRead.mockResolvedValue(undefined);

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await notificationCommandUsecase.markAsRead({
          userId: "user-1",
          notificationReceiptId: `receipt-${i}`,
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(mockCommandRepository.markAsRead).toHaveBeenCalledTimes(100);
      expect(duration).toBeLessThan(5000); // 5초 이내
    });

    it("대량의 알림 조회 응답 시간", async () => {
      const manyNotifications = Array.from({ length: 1000 }, (_, i) => ({
        id: `receipt-${i}`,
        createdAt: new Date(),
        content: `알림 ${i}`,
        isChecked: false,
      }));

      mockQueryRepository.findUnreadNotificationSEE.mockResolvedValue(
        manyNotifications.slice(0, 100), // 페이지당 100개
      );

      const startTime = Date.now();
      const result =
        await notificationQueryUsecase.getUnreadNotifications("user-1");
      const endTime = Date.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
