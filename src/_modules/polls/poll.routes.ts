import { Router } from "express";
import { PollController } from "./poll.controller";
import { TUserRole } from "../../_common/utils/token.util";

export interface IPollRouter {
  router: Router;
  PATH: string;
}

type AuthLike = {
  checkAuth: any;
  blockCsrfAttack?: any;
};

type RoleLike = {
  hasRole: (allowedRoles: TUserRole[]) => any;
};

type PollControllerLike = ReturnType<typeof PollController>;

export const PollRoutes = (
  pollController: PollControllerLike,
  auth: AuthLike,
  role: RoleLike,
): IPollRouter => {
  const router = Router();
  const PATH = "/api/v2/polls";

  const mustAuth = auth.checkAuth;
  const onlyAdmin = role.hasRole(["ADMIN", "SUPER_ADMIN"]);

  router.get("/", mustAuth, pollController.getPollList);
  router.post("/", mustAuth, onlyAdmin, pollController.createPoll);
  router.get("/:pollId", mustAuth, pollController.getPollDetail);
  router.patch("/:pollId", mustAuth, onlyAdmin, pollController.updatePoll);
  router.delete("/:pollId", mustAuth, onlyAdmin, pollController.deletePoll);

  router.post("/:pollId/options/:optionId/vote", mustAuth, pollController.vote);
  router.delete(
    "/:pollId/options/:optionId/vote",
    mustAuth,
    pollController.cancelVote,
  );

  return { router, PATH };
};
