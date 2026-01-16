import bcrypt from "bcrypt";
import { IHashManager } from "../../_common/ports/managers/bcrypt-hash-manager.interface";
import { IConfigUtil } from "../../_common/utils/config.util";

export const hashManager = (config: IConfigUtil): IHashManager => {
  const hash = async (plainString: string): Promise<string> => {
    return bcrypt.hash(plainString, config.parsed().SALT_LEVEL);
  };

  const compare = async (params: {
    plainString: string;
    hashedString: string;
  }): Promise<boolean> => {
    const { plainString, hashedString } = params;
    return bcrypt.compare(plainString, hashedString);
  };

  return {
    hash,
    compare,
  };
};
