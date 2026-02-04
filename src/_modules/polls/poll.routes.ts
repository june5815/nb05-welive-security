import { Router } from "express";
import { PollController } from "./poll.controller";

export const PollRoutes = (
  pollController: ReturnType<typeof PollController>,
  auth: any,
  role: any,
) => {
  const router = Router();

  /** 투표 생성 (관리자) */
  router.post("/", auth.verify, role.admin, pollController.createPoll);

  /** 투표 목록 */
  router.get("/", auth.verify, pollController.getPollList);

  /** 투표 상세 */
  router.get("/:pollId", auth.verify, pollController.getPollDetail);

  /** 투표 수정 (관리자) */
  router.patch("/:pollId", auth.verify, role.admin, pollController.updatePoll);

  /** 투표 */
  router.post(
    "/:pollId/options/:optionId/vote",
    auth.verify,
    pollController.vote,
  );

  /** 투표 취소 */
  router.delete("/:pollId/vote", auth.verify, pollController.cancelVote);

  return router;
};
