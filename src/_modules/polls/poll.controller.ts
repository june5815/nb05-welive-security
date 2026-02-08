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
  base: IBaseController,
  query: ReturnType<typeof PollQueryService>,
  command: ReturnType<typeof PollCommandService>,
) => {
  const validate = base.validate;

  const createPoll = async (req: Request, res: Response) => {
    const dto = validate(createPollReqSchema, {
      user: req.user,
      body: req.body,
    });

    const poll = await command.create(dto);
    res.status(201).json(poll);
  };

  const getPollList = async (req: Request, res: Response) => {
    const dto = validate(getPollListReqSchema, {
      query: req.query,
      user: req.user,
    });

    const result = await query.getList(dto);
    res.status(200).json(result);
  };

  const getPollDetail = async (req: Request, res: Response) => {
    const dto = validate(getPollDetailReqSchema, {
      params: req.params,
      user: req.user,
    });

    const result = await query.getDetail(dto);
    res.status(200).json(result);
  };

  const updatePoll = async (req: Request, res: Response) => {
    const dto = validate(updatePollReqSchema, {
      params: req.params,
      body: req.body,
      user: req.user,
    });

    await command.update(dto);
    res.status(204).json();
  };

  const deletePoll = async (req: Request, res: Response) => {
    const dto = validate(getPollDetailReqSchema, {
      params: req.params,
      user: req.user,
    });

    await command.delete(dto.params.pollId);
    res.status(204).json();
  };

  const vote = async (req: Request, res: Response) => {
    const dto = validate(votePollReqSchema, {
      params: req.params,
      user: req.user,
    });

    await command.vote(dto);
    res.status(204).json();
  };

  const cancelVote = async (req: Request, res: Response) => {
    const dto = validate(cancelVotePollReqSchema, {
      params: req.params,
      user: req.user,
    });

    await command.cancelVote(dto);
    res.status(204).json();
  };

  return {
    createPoll,
    getPollList,
    getPollDetail,
    updatePoll,
    deletePoll,
    vote,
    cancelVote,
  };
};
