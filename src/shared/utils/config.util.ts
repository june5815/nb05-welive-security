import dotenv from "dotenv";
import { z } from "zod";

export const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number(),
  FE_PORT: z.coerce.number(),
  PUBLIC_PATH: z.string().default("public"),
  DATABASE_URL: z.url(),
  SALT_LEVEL: z.coerce.number(),
  COOKIE_SECRET: z
    .string()
    .min(10, "세션 아이디 비밀번호는 최소 10자 이상입니다."),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(10, "토큰 시크릿은 최소 10자 이상입니다."),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(10, "토큰 시크릿은 최소 10자 이상입니다."),
  ACCESS_TOKEN_EXPIRES_IN: z.enum(["15m", "1h"]).default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.enum(["7d"]).default("7d"),
  CLIENT_DOMAIN: z.string(),
  JSON_LIMIT: z.string(),
  MAX_RETRIES: z.coerce.number(),
  OPTIMISTIC_LOCK_RETRY_DELAY_MS: z.coerce.number(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
});

export type ConfigType = z.infer<typeof configSchema>;

export interface IConfigUtil {
  parsed: () => ConfigType;
}

export const configUtil = (): IConfigUtil => {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({
      path: process.env.NODE_ENV === "development" ? ".env" : ".env.test",
    });
  }

  const result = configSchema.safeParse(process.env);

  let validatedConfig: ConfigType;

  if (result.success) {
    validatedConfig = result.data;
  } else {
    const issue = result.error.issues[0];
    console.error(issue);
    throw new Error(`${issue.path}: ${issue.message}`);
  }

  const parsed = (): ConfigType => {
    return validatedConfig;
  };

  return {
    parsed,
  };
};
