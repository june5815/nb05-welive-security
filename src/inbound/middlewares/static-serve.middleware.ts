import express from "express";
import { IConfigUtil } from "../../shared/utils/config.util";

export interface IStaticServeMiddleware {
  staticServeHandler: () => any;
}

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
