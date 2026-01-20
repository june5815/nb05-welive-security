import z from "zod";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../shared/exceptions/business.exception";

export interface IBaseController {
  validate: <T extends z.ZodTypeAny>(schema: T, data: unknown) => z.infer<T>;
}

export const BaseController = (): IBaseController => {
  const validate = <T extends z.ZodTypeAny>(schema: T, data: unknown) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new BusinessException({
        type: BusinessExceptionType.VALIDATION_ERROR,
        message: issue.message,
      });
    }
    return result.data;
  };

  return {
    validate,
  };
};
