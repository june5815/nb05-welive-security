import express from "express";
import { IConfigUtil } from "../../shared/utils/config.util";

export interface IJsonMiddleware {
  jsonHandler: () => any;
}

export const JsonMiddleware = (configUtil: IConfigUtil): IJsonMiddleware => {
  const options = {
    limit: configUtil.parsed().JSON_LIMIT,
  };

  const jsonHandler = () => {
    return express.json(options);
  };

  return {
    jsonHandler,
  };
};
