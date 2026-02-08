import { Router, RequestHandler } from "express";
import { IComplaintController } from "./complaint.controller";

export const ComplaintRouter = (
  baseRouter: Router,
  controller: IComplaintController,
  auth: RequestHandler,
  role: (roles: string[]) => RequestHandler,
): Router => {
  const router = Router();

  router.post("/", auth, role(["USER"]), controller.create);
  router.get("/", auth, role(["USER", "ADMIN"]), controller.list);
  router.get("/:complaintId", auth, role(["USER", "ADMIN"]), controller.detail);

  baseRouter.use("/complaints", router);

  return baseRouter;
};
