import { Router } from "express";
import { complaintSSEController } from "../controllers/complaint-sse.controller";

export const createComplaintSSERouter = () => {
  const router = Router();

  router.get("/sse", complaintSSEController);

  return router;
};
