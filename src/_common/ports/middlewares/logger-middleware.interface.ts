import { Handler } from "express";

export interface ILoggerMiddleware {
  loggerHandler: () => Handler;
}
