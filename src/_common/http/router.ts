import express from "express";
// import { createApartmentRoutes } from "../../_modules/apartments/routes";
import { ApartmentQueryRepository } from "../ports/repos/apartment/apartment-query-repo.interface";

/**
 * 모든 라우트를 Express 앱에 등록
 * => 중앙 라우트 매니저
 * => 모든 모듈의 라우트를 등록하고 조율하는 책임을 가진 파일입니다.
 * => "어떤 경로에 어느 모듈을 붙을까?"를 결정합니다.
 */
export function setupRoutes(
  app: express.Application,
  apartmentRepo: ApartmentQueryRepository,
) {
  // app.use("/api/v2/apartments", createApartmentRoutes(apartmentRepo));
  // TODO: 다른 모듈의 라우트 추가
  // app.use('/api/v2/users', createUserRoutes(userRepo));
  // app.use('/api/v2/residents', createResidentRoutes(residentRepo));
  // app.use('/api/v2/complaints', createComplaintRoutes(complaintRepo));
  // app.use('/api/v2/polls', createPollRoutes(pollRepo));
  // app.use('/api/v2/notices', createNoticeRoutes(noticeRepo));
  // app.use('/api/v2/comments', createCommentRoutes(commentRepo));
  // app.use('/api/v2/notifications', createNotificationRoutes(notificationRepo));
}
