import bcrypt from "bcrypt";
import { IHashManager } from "../../application/ports/managers/hash.manager.interface.js";

const DEFAULT_SALT_ROUNDS = 10;

export const hashManager = (
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): IHashManager => {
  const hash = async (plainString: string): Promise<string> => {
    return bcrypt.hash(plainString, saltRounds);
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
