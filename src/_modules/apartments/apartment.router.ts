import { Router } from "express";
import { IBaseRouter } from "../_base/base.router";
import { IApartmentController } from "./apartment.controller";

export interface IApartmentRouter {
  router: Router;
  PATH: string;
}

export const ApartmentRouter = (
  baseRouter: IBaseRouter,
  apartmentController: IApartmentController,
): IApartmentRouter => {
  const router = baseRouter.router;
  const catchError = baseRouter.catchError;
  const PATH = "/api/v2/apartments";

  router.get("/", catchError(apartmentController.getApartmentList));
  router.get("/:id", catchError(apartmentController.getApartmentDetail));

  return {
    router,
    PATH,
  };
};
