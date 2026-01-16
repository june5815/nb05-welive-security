import { PrismaClient } from "@prisma/client";
import {
  IUnitOfWork,
  UnitOfWorkOptions,
} from "../../application/ports/u-o-w.interface";
import {
  TechnicalExceptionType,
  TechnicalException,
} from "../../_common/exceptions/technical.exception";
import { IConfigUtil } from "../../_common/utils/config.util";
import { asyncContextStorage } from "../../_common/utils/async-context-storage";

export const UOW = (
  prismaClient: PrismaClient,
  configUtil: IConfigUtil,
): IUnitOfWork => {
  const doTx = async <T>(
    work: () => Promise<T>,
    options: UnitOfWorkOptions = {
      transactionOptions: {
        useTransaction: false,
      },
      useOptimisticLock: true,
    },
  ): Promise<T> => {
    const { transactionOptions, useOptimisticLock } = options;

    let lastError: unknown;

    const maxRetries = useOptimisticLock ? configUtil.parsed().MAX_RETRIES : 0;
    for (let i = 0; i <= maxRetries; i++) {
      if (i > 0) {
        console.warn(`재시도 ${i}/${maxRetries}회차`);
      }

      try {
        if (!transactionOptions.useTransaction) {
          return await work();
        }

        return await prismaClient.$transaction(
          async (tx) => {
            return await asyncContextStorage.run(tx, work);
          },
          {
            isolationLevel: transactionOptions.isolationLevel,
            maxWait: 5000,
            timeout: 5000,
          },
        );
      } catch (error) {
        if (
          error instanceof TechnicalException &&
          error.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED &&
          i < maxRetries
        ) {
          const baseDelay = configUtil.parsed().OPTIMISTIC_LOCK_RETRY_DELAY_MS;
          const jitter = Math.random() * 100;
          const delay = Math.pow(2, i) * baseDelay + jitter;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        lastError = error;
        break;
      }
    }

    throw lastError;
  };

  return {
    doTx,
  };
};
