import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";

export interface IBaseRouter {
  router: Router;
  catchError: (handler: RequestHandler) => RequestHandler;
}

export const BaseRouter = (): IBaseRouter => {
  const router: Router = express.Router();

  const catchError = (handler: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  };

  return {
    router,
    catchError,
  };
};
