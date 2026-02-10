import { NextFunction, Request, Response } from "express";

export interface IAuthMiddleware {
  blockCsrfAttack: (req: Request, res: Response, next: NextFunction) => void;
  checkAuth: (req: Request, res: Response, next: NextFunction) => void;
}
