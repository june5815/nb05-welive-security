import { z } from "zod";

// 로그인
export const loginReqSchema = z.object({
  body: z.object({
    username: z.string().trim().nonempty("아이디를 입력해주세요."),
    password: z.string().trim().nonempty("비밀번호를 입력해주세요."),
  }),
});
export type LoginReqDto = z.infer<typeof loginReqSchema>;

// 토큰 갱신
export const refreshTokenReqSchema = z.object({
  cookie: z.object({
    refreshToken: z
      .string()
      .trim()
      .nonempty("리프레시 토큰이 존재하지 않습니다."),
  }),
});
export type RefreshTokenReqDto = z.infer<typeof refreshTokenReqSchema>;
