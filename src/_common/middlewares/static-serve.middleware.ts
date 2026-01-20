import express from "express";
import { IConfigUtil } from "../utils/config.util";
import { IStaticServeMiddleware } from "../ports/middlewares/static-serve-middleware.interface";

export const StaticServeMiddleware = (
  configUtil: IConfigUtil,
): IStaticServeMiddleware => {
  const path = configUtil.parsed().PUBLIC_PATH;

  const staticServeHandler = () => {
    return express.static(path);
  };

  return {
    staticServeHandler,
  };
};
