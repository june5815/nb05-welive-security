import { Router } from "express";
import { PollController } from "./poll.controller";

export const PollRoutes = (
  pollController: ReturnType<typeof PollController>,
  auth: any,
  role: any,
) => {
  const router = Router();

  router.get("/", auth.verify, pollController.getPollList);
  router.post("/", auth.verify, role.admin, pollController.createPoll);
  router.get("/:pollId", auth.verify, pollController.getPollDetail);
  router.patch("/:pollId", auth.verify, role.admin, pollController.updatePoll);
  router.delete("/:pollId", auth.verify, role.admin, pollController.deletePoll);

  router.post(
    "/:pollId/options/:optionId/vote",
    auth.verify,
    pollController.vote,
  );

  router.delete(
    "/:pollId/options/:optionId/vote",
    auth.verify,
    pollController.cancelVote,
  );

  return router;
};
