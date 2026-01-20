import { IBaseController } from "../_base/base.controller";
import { IAuthCommandService } from "./service/auth-command.service";
import { Request, Response } from "express";
import { loginReqSchema, refreshTokenReqSchema } from "./dtos/req/auth.request";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";

export interface IAuthController {
  login: (req: Request, res: Response) => Promise<Response>;
  logout: (req: Request, res: Response) => Promise<Response>;
  refreshToken: (req: Request, res: Response) => Promise<Response>;
}

export const AuthController = (
  baseController: IBaseController,
  authCommandService: IAuthCommandService,
): IAuthController => {
  const validate = baseController.validate;

  const setCookie = (
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) => {
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
      httpOnly: true,
      secure: isProduction,
      signed: true,
      sameSite: "lax" as const,
    };

    res.cookie("access_token", accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };

  const login = async (req: Request, res: Response): Promise<Response> => {
    const reqDto = validate(loginReqSchema, { body: req.body });

    const { loginResDto, tokenResDto } = await authCommandService.login(reqDto);

    setCookie(res, tokenResDto.accessToken, tokenResDto.refreshToken);

    return res.status(200).json(loginResDto);
  };

  const logout = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.signedCookies.refresh_token;
    if (refreshToken) {
      await authCommandService.logout(refreshToken);
    } else {
      throw new BusinessException({
        type: BusinessExceptionType.UNAUTHORIZED_REQUEST,
      });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      signed: true,
      sameSite: "lax" as const,
    };
    res.clearCookie("access_token", clearOptions);
    res.clearCookie("refresh_token", clearOptions);

    return res.status(204).json();
  };

  const refreshToken = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const reqDto = validate(refreshTokenReqSchema, {
      cookie: {
        refreshToken: req.signedCookies.refresh_token,
      },
    });

    const newTokenResDto = await authCommandService.refreshToken(reqDto);

    setCookie(
      res,
      newTokenResDto.newAccessToken,
      newTokenResDto.newRefreshToken,
    );

    return res.status(204).json();
  };

  return {
    login,
    logout,
    refreshToken,
  };
};
