import { Request, Response } from "express";
import { IBaseController } from "../_base/base.controller";
import { PollQueryService } from "./service/poll-query.service";
import {
  createPollReqSchema,
  getPollListReqSchema,
  getPollDetailReqSchema,
  updatePollReqSchema,
  deletePollReqSchema,
  votePollReqSchema,
  cancelVotePollReqSchema,
} from "./dtos/req/poll.request";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../_common/exceptions/business.exception";
import { PollCommandService } from "./service/poll-command.service";

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

    const result = await command.create(dto);
    res.status(201).json(result);
  };

  const getPollList = async (req: Request, res: Response) => {
    const dto = validate(getPollListReqSchema, {
      user: req.user,
      query: req.query,
    });

    const result = await query.getList(dto);
    res.status(200).json(result);
  };

  const getPollDetail = async (req: Request, res: Response) => {
    const dto = validate(getPollDetailReqSchema, {
      user: req.user,
      params: req.params,
    });

    const result = await query.getDetail(dto);
    if (!result) {
      throw new BusinessException({ type: BusinessExceptionType.NOT_FOUND });
    }

    res.status(200).json(result);
  };

  const updatePoll = async (req: Request, res: Response) => {
    const dto = validate(updatePollReqSchema, {
      user: req.user,
      params: req.params,
      body: req.body,
    });

    await command.update(dto);
    res.status(204).end();
  };

  const deletePoll = async (req: Request, res: Response) => {
    const dto = validate(deletePollReqSchema, {
      user: req.user,
      params: req.params,
    });

    await command.delete(dto);
    res.status(204).end();
  };

  const vote = async (req: Request, res: Response) => {
    const dto = validate(votePollReqSchema, {
      user: req.user,
      params: req.params,
    });

    await command.vote(dto);
    res.status(204).end();
  };

  const cancelVote = async (req: Request, res: Response) => {
    const dto = validate(cancelVotePollReqSchema, {
      user: req.user,
      params: req.params,
    });

    await command.cancelVote(dto);
    res.status(204).end();
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
