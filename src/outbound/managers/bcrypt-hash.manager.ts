import bcrypt from "bcrypt";
import { IHashManager } from "../../application/ports/managers/bcrypt-hash-manager.interface";
import { IConfigUtil } from "../../shared/utils/config.util";

export const HashManager = (config: IConfigUtil): IHashManager => {
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
