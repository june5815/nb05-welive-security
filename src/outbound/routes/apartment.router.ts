import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApartmentRoutes } from "../../_modules/apartments/routes";
import { ApartmentQueryAdapter } from "../../_infra/repo/apartment/apartment-query.adapter";
import { ApartmentRepo } from "../../_infra/repo/apartment/apartment.repo";

export const createApartmentRouter = (db: PrismaClient): Router => {

  const apartmentRepo = ApartmentRepo(db);
  const apartmentQueryAdapter = new ApartmentQueryAdapter(apartmentRepo);


  return createApartmentRoutes(apartmentQueryAdapter);
};
