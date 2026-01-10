import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApartmentRepository } from "../repositories/apartment.repository";
import { createGetApartmentsController } from "../controllers/apartment.controller";

export const createApartmentRouter = (db: PrismaClient) => {
  const router = Router();
  const repo = createApartmentRepository(db);
  const getApartmentsController = createGetApartmentsController(repo);

  router.get("/", getApartmentsController);

  return router;
};
