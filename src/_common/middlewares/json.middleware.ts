import express from "express";
import { IConfigUtil } from "../utils/config.util";
import { IJsonMiddleware } from "../ports/middlewares/json-middleware.interface";

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
