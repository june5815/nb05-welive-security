import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { PollCommandService } from "./service/poll-command.service";
import { PollQueryService } from "./service/poll-query.service";

import {
  createPollReqSchema,
  getPollListReqSchema,
  getPollDetailReqSchema,
  updatePollReqSchema,
  votePollReqSchema,
  cancelVotePollReqSchema,
} from "./dtos/req/poll.request";

export const PollController = (
  baseController: IBaseController,
  pollQueryService: ReturnType<typeof PollQueryService>,
  pollCommandService: ReturnType<typeof PollCommandService>,
) => {
  const validate = baseController.validate;

  /** 투표 생성 */
  const createPoll = async (req: Request, res: Response) => {
    const reqDto = validate(createPollReqSchema, {
      user: req.user,
      body: req.body,
    });

    const pollId = await pollCommandService.create({
      user: reqDto.user,
      body: {
        title: reqDto.body.title,
        content: reqDto.body.description ?? "",
        endDate: reqDto.body.endAt,
        options: reqDto.body.options,
      },
    });

    res.status(201).json({ pollId });
  };

  /** 투표 목록 */
  const getPollList = async (req: Request, res: Response) => {
    const dto = validate(getPollListReqSchema, {
      query: {
        ...req.query,
        apartmentId: req.user!.apartmentId,
      },
    });

    const result = await pollQueryService.getList(dto);
    res.status(200).json(result);
  };

  /** 투표 상세 */
  const getPollDetail = async (req: Request, res: Response) => {
    const dto = validate(getPollDetailReqSchema, {
      params: req.params,
    });

    const result = await pollQueryService.getDetail(dto.params.pollId);
    res.status(200).json(result);
  };

  /** 투표 수정 */
  const updatePoll = async (req: Request, res: Response) => {
    const reqDto = validate(updatePollReqSchema, {
      params: req.params,
      body: req.body,
      user: req.user,
    });

    await pollCommandService.update({
      params: reqDto.params,
      user: reqDto.user,
      body: {
        title: reqDto.body.title,
        content: reqDto.body.description,
        endDate: reqDto.body.endAt,
      },
    });

    res.status(204).json();
  };

  /** 투표 */
  const vote = async (req: Request, res: Response) => {
    const dto = validate(votePollReqSchema, {
      params: req.params,
      user: {
        ...req.user,
        role: "USER",
      },
    });

    await pollCommandService.vote(dto);
    res.status(200).json();
  };

  /** 투표 취소 */
  const cancelVote = async (req: Request, res: Response) => {
    const dto = validate(cancelVotePollReqSchema, {
      params: req.params,
      user: {
        ...req.user,
        role: "USER",
      },
    });

    await pollCommandService.cancelVote(dto);
    res.status(200).json();
  };

  return {
    createPoll,
    getPollList,
    getPollDetail,
    updatePoll,
    vote,
    cancelVote,
  };
};
